#!/usr/bin/env node
/* eslint-disable no-use-before-define */

const { readFileSync, existsSync } = require('fs');
const path = require('path');
const { program } = require('commander');
const defaultConfig = require('./config/default.json');
const packageInfo = require('./package.json');
const schema = require('./schema/config.schema.json');

import('./lib/index.js').then(({ Config, Router, Utils }) => {
  const logger = Utils.logger;

  program.name(packageInfo.name).description('Simple protocol router /s');
  program.option('-c, --config <path>', 'location of config file', undefined);
  program.option('-h, --html <path>', 'location of html to serve', undefined);
  program.option('-d, --debug', 'turn on debug logging', false);
  program.option('-t, --trace', 'turn on trace logging', false);
  program.parse(process.argv);

  const options = program.opts();

  const isChildProcess = process.send !== undefined;

  if (options.debug) {
    logger.level = 20;
  }

  if (options.trace) {
    logger.level = 10;
  }

  logger.debug(`app: starting ${packageInfo.name} version: ${packageInfo.version}`);

  let config = {};
  // if there is a config argument load it as the config
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
    // if not load a default
    logger.debug(`app: loading default config`);
    config = new Config(defaultConfig, schema);
  }

  const router = new Router(config);
  if (options.html) {
    if (existsSync(options.html)) {
      const filePath = path.resolve(options.html);
      router.servePath(filePath);
    } else {
      console.error(`provided html path = ${options.html} does not seem to exist skipping...`);
    }
  }

  router.on('config_updated', (updatedConfig) => {
    if (isChildProcess) {
      process.send({
        eventType: 'config_updated',
        config: updatedConfig,
      });
    }
  });

  router.on('message', (message) => {
    if (isChildProcess) {
      process.send({
        eventType: 'message',
        message,
      });
    }
  });

  process.on('message', (message) => {
    switch (message.eventType) {
      case 'check_config':
        try {
          const newConfig = new Config(message.config, schema);
          if (isChildProcess) {
            process.send({
              eventType: 'config_valid',
              config: newConfig.toJSON(),
            });
          }
        } catch (errors) {
          if (isChildProcess) {
            process.send({
              eventType: 'config_error',
              errors,
            });
          }
          logger.error(`app: problem loading new config`);
          logger.error(errors.toString());
        }
        break;
      case 'update_config':
        try {
          router.config = new Config(message.config, schema);
          router.reload();
          logger.info('app: new config applied router reload');
        } catch (errors) {
          logger.error('app: errors loading config');
          if (isChildProcess) {
            process.send({
              eventType: 'config_error',
              errors,
            });
          }
        }
        break;
      case 'destroy':
        router.stop();
      // eslint-disable-next-line no-fallthrough
      default:
        logger.error(`app: unhandled process event type = ${message.eventType}`);
        break;
    }
  });

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
