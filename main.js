#!/usr/bin/env node
/* eslint-disable no-use-before-define */

const { readFileSync } = require('fs');

const { program } = require('commander');
const { logger } = require('./lib/utils');
const { Config, Router } = require('./lib');

const defaultConfig = require('./config/default.json');
const packageInfo = require('./package.json');

program.name(packageInfo.name).description('Simple protocol router /s');
program.option('-c, --config <path>', 'location of config file', undefined);
program.option('-d, --debug', 'turn on debug logging', false);
program.option('-t, --trace', 'turn on trace logging', false);
program.parse(process.argv);

const options = program.opts();

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
    config = new Config(configToLoad);
  } catch (error) {
    logger.error(`app: could not load config from ${options.config}`);
    logger.error(error);
  }
} else {
  // if not load a default
  logger.debug(`app: loading default config`);
  config = new Config(defaultConfig);
}

const router = new Router(config);

process.on('message', (message) => {
  switch (message.eventType) {
    case 'check_config':
      try {
        const newConfig = new Config(message.config);
        process.send({
          eventType: 'config_valid',
          config: newConfig.toJSON(),
        });
      } catch (errors) {
        process.send({
          eventType: 'config_error',
          errors,
        });
        logger.error(`app: problem loading new config`);
        logger.error(errors.toString());
      }
      break;
    case 'update_config':
      try {
        router.config = new Config(message.config);
        router.reload();
        logger.info('app: new config applied router reload');
      } catch (errors) {
        logger.error('app: errors loading config');
        process.send({
          eventType: 'config_error',
          errors,
        });
      }
      break;
    case 'destroy':
      router.stop();
      process.exit(0);
    default:
      logger.error(`app: unhandled process event type = ${message.eventType}`);
      break;
  }
});

router.start();
