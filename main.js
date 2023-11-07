#!/usr/bin/env node
/* eslint-disable no-use-before-define */

const { readFileSync, existsSync, writeFileSync } = require('fs');
const path = require('path');
const { program } = require('commander');
const defaultConfig = require('./sample/config/default.json');
const defaultVars = require('./sample/vars/default.json');
const packageInfo = require('./package.json');
const schema = require('./schema/config.schema.json');

program.name(packageInfo.name);
program.version(packageInfo.version);
program.description('Simple protocol router /s');
program.option('-c, --config <path>', 'location of config file', undefined);
program.option('-v, --vars <path>', 'location of file containing vars', undefined);
program.option('-w, --webui <path>', 'location of webui html to serve', path.join(__dirname, 'webui/dist/webui'));
program.option(
  '--disable-action <action-type>',
  'action type to disable',
  (value, previous) => previous.concat([value]),
  []
);
program.option(
  '--disable-protocol <protocol-type>',
  'protocol type to disable',
  (value, previous) => previous.concat([value]),
  []
);
program.option(
  '--disable-trigger <trigger-type>',
  'trigger type to disable',
  (value, previous) => previous.concat([value]),
  []
);
program.option('-d, --debug', 'turn on debug logging', false);
program.option('-t, --trace', 'turn on trace logging', false);
program.parse(process.argv);

const options = program.opts();
const isChildProcess = process.send !== undefined;

import('showbridge-lib').then(({ Config, Router, Utils }) => {
  const logger = Utils.logger;

  if (options.debug) {
    logger.level = 20;
  }

  if (options.trace) {
    logger.level = 10;
  }

  logger.info(`app: starting ${packageInfo.name} version: ${packageInfo.version}`);

  let config = {};

  // NOTE(jwetzell): if there is a config argument load it as the config
  if (options.config) {
    try {
      logger.debug(`app: loading config from ${options.config}`);
      const configToLoad = JSON.parse(readFileSync(options.config));
      config = new Config(configToLoad, schema);
    } catch (error) {
      logger.error(`app: could not load config from ${options.config}`);
      logger.error(error);
    }
  } else {
    // NOTE(jwetzell): if not load a default
    logger.debug(`app: loading default config`);
    config = new Config(defaultConfig, schema);
  }

  const router = new Router(config);

  if (options.vars) {
    try {
      logger.debug(`app: loading vars from ${options.vars}`);
      const varsToLoad = JSON.parse(readFileSync(options.vars));
      router.vars = varsToLoad;
      router.emit('varsUpdated', router.vars);
    } catch (error) {
      logger.error(`app: could not load vars from ${options.vars}`);
      logger.error(error);
    }
  } else {
    // NOTE(jwetzell): if not load a default
    logger.debug(`app: loading default vars`);
    router.vars = defaultVars;
  }

  if (options.webui) {
    if (existsSync(options.webui)) {
      const filePath = path.resolve(options.webui);
      router.servePath(filePath);
    } else {
      logger.error(`app: provided webui path = ${options.webui} does not seem to exist skipping...`);
    }
  }

  router.on('configUpdated', (updatedConfig) => {
    if (isChildProcess) {
      process.send({
        eventType: 'configUpdated',
        config: updatedConfig,
      });
    } else if (options.config) {
      try {
        writeFileSync(options.config, JSON.stringify(updatedConfig, undefined, 2));
        logger.debug(`app: updated config written to ${options.config}`);
      } catch (error) {
        logger.error(`app: problem saving config to ${options.config}`);
        logger.error(error);
      }
    }
  });

  router.on('varsUpdated', (updatedVars) => {
    if (isChildProcess) {
      process.send({
        eventType: 'varsUpdated',
        vars: updatedVars,
      });
    } else if (options.vars) {
      try {
        writeFileSync(options.vars, JSON.stringify(updatedVars, undefined, 2));
        logger.debug(`app: updated vars written to ${options.vars}`);
      } catch (error) {
        logger.error(`app: problem saving vars to ${options.vars}`);
        logger.error(error);
      }
    }
  });

  router.on('messageIn', (messageEvent) => {
    if (isChildProcess) {
      process.send({
        eventType: 'messageIn',
        ...messageEvent,
      });
    }
  });

  router.on('trigger', (triggerEvent) => {
    if (isChildProcess) {
      process.send({
        eventType: 'trigger',
        ...triggerEvent,
      });
    }
  });

  router.on('action', (actionEvent) => {
    if (isChildProcess) {
      process.send({
        eventType: 'action',
        ...actionEvent,
      });
    }
  });

  router.on('transform', (transformEvent) => {
    if (isChildProcess) {
      process.send({
        eventType: 'transform',
        ...transformEvent,
      });
    }
  });

  process.on('message', (message) => {
    switch (message.eventType) {
      case 'checkConfig':
        try {
          const newConfig = new Config(message.config, schema);
          if (isChildProcess) {
            process.send({
              eventType: 'configValid',
              config: newConfig.toJSON(),
            });
          }
        } catch (errors) {
          if (isChildProcess) {
            process.send({
              eventType: 'configError',
              errors,
            });
          }
          logger.error(`app: problem loading new config`);
          logger.error(errors.toString());
        }
        break;
      case 'updateConfig':
        try {
          router.config = new Config(message.config, schema);
          router.reload();
          logger.info('app: new config applied router reload');
        } catch (errors) {
          logger.error('app: errors loading config');
          if (isChildProcess) {
            process.send({
              eventType: 'configError',
              errors,
            });
          }
        }
        break;
      case 'updateVars':
        if (message.vars) {
          router.vars = message.vars;
          router.emit('varsUpdated', router.vars);
        }
        break;
      case 'destroy':
        logger.info('app: process received a request to tear down');
        router.stop();
        break;
      default:
        logger.error(`app: unhandled process event type = ${message.eventType}`);
        break;
    }
  });

  if (options.disableAction.length > 0) {
    options.disableAction.forEach((type) => {
      logger.debug(`app: disabling action ${type}`);
      router.disableAction(type);
    });
  }

  if (options.disableProtocol.length > 0) {
    options.disableProtocol.forEach((type) => {
      logger.debug(`app: disabling protocol ${type}`);
      router.disableProtocol(type);
    });
  }

  if (options.disableTrigger.length > 0) {
    options.disableTrigger.forEach((type) => {
      logger.debug(`app: disabling trigger ${type}`);
      router.disableTrigger(type);
    });
  }

  router.start();

  router.on('stopped', () => {
    logger.info('app: router has stopped exiting...');
    process.exit(0);
  });

  process.once('SIGINT', () => {
    logger.info('app: shutting down router');
    router.stop();
  });
});
