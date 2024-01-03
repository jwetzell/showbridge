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
let discordEvents = ['connect', 'disconnect', 'leave', 'join'];

if (process.env.DISCORD_WEBHOOK_URL) {
  logger.info('cloud: setting up discord client');
  discord = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });
  if (process.env.DISCORD_EVENTS) {
    try {
      const eventsToSend = process.env.DISCORD_EVENTS.trim()
        .split(',')
        .map((event) => event.trim());
      discordEvents = discordEvents.filter((event) => eventsToSend.includes(event));
    } catch (error) {
      logger.error('cloud: failed to parse discord events from ENV');
    }
  }
} else {
  discordEvents = [];
}

function sendToDiscord(event, data) {
  console.log(discordEvents);
  if (discord) {
    if (discordEvents.includes(event)) {
      discord.send(data).catch(logger.error);
    }
  }
}

module.exports = {
  logger,
  sendToDiscord,
};
