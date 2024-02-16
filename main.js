#!/usr/bin/env node
/* eslint-disable no-use-before-define */

const { readFileSync, existsSync, writeFileSync } = require('fs');
const path = require('path');
const { program, Option } = require('commander');
const defaultConfig = require('./sample/config/default.json');
const defaultVars = require('./sample/vars/default.json');
const packageInfo = require('./package.json');
const schema = require('./schema/config.schema.json');

program.name(packageInfo.name);
program.version(packageInfo.version);
program.description('Simple protocol router /s');
program.option('-c, --config <path>', 'location of config file', undefined);
program.option('-v, --vars <path>', 'location of file containing vars', undefined);
program.option(
  '-w, --webui <path>',
  'location of webui html to serve',
  path.join(__dirname, 'node_modules/@showbridge/webui/dist/webui')
);
program.option('--disable-action <action-type...>', 'action type(s) to disable');
program.option('--disable-protocol <protocol-type...>', 'protocol type(s) to disable');
program.option('--disable-trigger <trigger-type...>', 'trigger type(s) to disable');
program.option('--disable-transform <transform-type...>', 'transform type(s) to disable');
program.addOption(
  new Option('-l, --log-level <level>', 'log level')
    .choices(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info')
);

program.parse(process.argv);

const options = program.opts();
const isChildProcess = process.send !== undefined;

import('@showbridge/lib').then(({ Config, Router, Utils }) => {
  const logger = Utils.logger;

  if (options.logLevel) {
    switch (options.logLevel) {
      case 'trace':
        logger.level = 10;
        break;
      case 'debug':
        logger.level = 20;
        break;
      case 'info':
        logger.level = 30;
        break;
      case 'warn':
        logger.level = 40;
        break;
      case 'error':
        logger.level = 50;
        break;
      case 'fatal':
        logger.level = 60;
        break;
      default:
        logger.level = 30;
        break;
    }
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
        eventName: 'configUpdated',
        data: updatedConfig,
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
        eventName: 'varsUpdated',
        data: updatedVars,
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
        eventName: 'messageIn',
        data: messageEvent,
      });
    }
  });

  router.on('trigger', (triggerEvent) => {
    if (isChildProcess) {
      process.send({
        eventName: 'trigger',
        data: triggerEvent,
      });
    }
  });

  router.on('action', (actionEvent) => {
    if (isChildProcess) {
      process.send({
        eventName: 'action',
        data: actionEvent,
      });
    }
  });

  router.on('transform', (transformEvent) => {
    if (isChildProcess) {
      process.send({
        eventName: 'transform',
        data: transformEvent,
      });
    }
  });

  process.on('message', (message) => {
    switch (message.eventName) {
      case 'checkConfig':
        try {
          const newConfig = new Config(message.data, schema);
          if (isChildProcess) {
            process.send({
              eventName: 'configValid',
              data: newConfig.toJSON(),
            });
          }
        } catch (errors) {
          if (isChildProcess) {
            process.send({
              eventName: 'configError',
              data: errors,
            });
          }
          logger.error(`app: problem loading new config`);
          logger.error(errors.toString());
        }
        break;
      case 'updateConfig':
        try {
          router.config = new Config(message.data, schema);
          logger.info('app: new config applied router reload');
        } catch (errors) {
          logger.error('app: errors loading config');
          if (isChildProcess) {
            process.send({
              eventName: 'configError',
              data: errors,
            });
          }
        }
        break;
      case 'updateVars':
        if (message.vars) {
          router.vars = message.data;
          router.emit('varsUpdated', router.vars);
        }
        break;
      case 'destroy':
        logger.info('app: process received a request to tear down');
        router.stop();
        break;
      case 'reloadProtocols':
        if (message.data && Array.isArray(message.data)) {
          message.data.forEach((protocolType) => {
            router.reloadProtocol(protocolType);
          });
        }
        break;
      default:
        logger.error(`app: unhandled process event type = ${message.eventName}`);
        break;
    }
  });

  if (options.disableAction?.length > 0) {
    options.disableAction.forEach((type) => {
      logger.debug(`app: disabling action ${type}`);
      router.disableAction(type);
    });
  }

  if (options.disableProtocol?.length > 0) {
    options.disableProtocol.forEach((type) => {
      logger.debug(`app: disabling ${type} protocol`);
      router.disableProtocol(type);
    });
  }

  if (options.disableTrigger?.length > 0) {
    options.disableTrigger.forEach((type) => {
      logger.debug(`app: disabling ${type} trigger`);
      router.disableTrigger(type);
    });
  }

  if (options.disableTransform?.length > 0) {
    options.disableTransform.forEach((type) => {
      logger.debug(`app: disabling ${type} transform`);
      router.disableTransform(type);
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

  if (isChildProcess) {
    // NOTE(jwetzell): this seems to detect the parent process disappearing
    process.on('disconnect', () => {
      logger.info('app: parent process exited');
      router.stop();
    });
  }
});
