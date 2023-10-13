#!/usr/bin/env node

const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const { createAdapter } = require('@socket.io/redis-streams-adapter');
const { createClient } = require('redis');
const bcrypt = require('bcrypt');
const pino = require('pino');
const express = require('express');
const { createServer } = require('http');
const path = require('path');
require('dotenv').config();

const app = express();

// NOTE(jwetzell): load socket.io admin-ui on /ui
app.use('/ui', express.static(path.join(__dirname, '../admin-ui/ui/dist')));

const httpServer = createServer(app);

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

function setupServer(redisClient) {
  const io = new Server(httpServer, {
    cors: {
      origin: 'https://admin.socket.io',
      credentials: true,
    },
  });

  const adminUIOptions = {
    auth: false,
  };

  if (process.env.ADMIN_UI_USERNAME && process.env.ADMIN_UI_PASSWORD) {
    adminUIOptions.auth = {
      type: 'basic',
      username: process.env.ADMIN_UI_USERNAME,
      password: bcrypt.hashSync(process.env.ADMIN_UI_PASSWORD, 10),
    };
  }

  instrument(io, adminUIOptions);

  if (redisClient) {
    logger.info('cloud: socket io server being started with redis');
    io.adapter(createAdapter(redisClient));
  } else {
    logger.info('cloud: socket io server being started without redis');
  }

  io.on('connection', (socket) => {
    logger.info(`cloud: socket ${socket.id} connected`);
    socket.on('join', (rooms) => {
      if (rooms) {
        if (Array.isArray(rooms)) {
          rooms.forEach((room) => {
            logger.info(`cloud: socket <${socket.id}> joined to room <${room}>`);
          });
          socket.join(rooms);
        }
      }
    });

    socket.on('send', (room, msgObj) => {
      logger.debug(`cloud: proxying message to room ${room}`);
      logger.trace(msgObj);
      io.to(room).emit('message', msgObj);
    });
  });

  const listenPort = process.env.PORT ? process.env.PORT : 8888;
  httpServer.listen(listenPort);
}

if (process.env.REDIS_URL) {
  const redisClient = createClient({ url: process.env.REDIS_URL });

  redisClient.connect().then(() => {
    setupServer(redisClient);
  });
} else {
  setupServer();
}
