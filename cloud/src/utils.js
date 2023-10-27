const { WebhookClient } = require('discord.js');
const pino = require('pino');

require('dotenv').config();

const logger = pino();

if (process.env.LOG_LEVEL) {
  try {
    const logLevel = parseInt(process.env.LOG_LEVEL, 10);
    logger.level = logLevel;
  } catch (error) {
    logger.error(
      `cloud: unable to set logger level to <${process.env.LOG_LEVEL}>. see pino log levels for valid options`
    );
  }
}

let discord;

if (process.env.DISCORD_WEBHOOK_URL) {
  logger.info('cloud: setting up discord client');
  discord = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });
}

function sendToDiscord(data) {
  if (discord) {
    discord.send(data).catch(logger.error);
  }
}
module.exports = {
  logger,
  sendToDiscord,
};
