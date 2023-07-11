#!/usr/bin/env node
/* eslint-disable no-use-before-define */

const { readFileSync } = require('fs');

const { logger } = require('./js/utils/helper');

const Config = require('./js/config');
const defaultConfig = require('./config/default.json');
const Router = require('./js/router');

let config = {};
// if there is an argument load it as the config
if (process.argv.length === 3) {
  const configFile = process.argv[2];
  const configToLoad = JSON.parse(readFileSync(configFile));
  config = new Config(configToLoad);
  logger.debug(`app: loading config from ${configFile}`);
} else {
  // if not load a default
  logger.debug(`app: loading default config`);
  config = new Config(defaultConfig);
}

const router = new Router(config);
router.start();
