#!/usr/bin/env node
/* eslint-disable no-use-before-define */

const { readFileSync } = require('fs');

const { program } = require('commander');
const { logger } = require('./js/utils/helper');

const Config = require('./js/config');
const defaultConfig = require('./config/default.json');
const Router = require('./js/router');
const packageInfo = require('../package.json');

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
router.start();
