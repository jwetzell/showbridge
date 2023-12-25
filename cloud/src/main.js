#!/usr/bin/env node

const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');
const { createAdapter } = require('@socket.io/redis-streams-adapter');
const { createClient } = require('redis');
const bcrypt = require('bcrypt');
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const { logger, sendToDiscord } = require('./utils');
require('dotenv').config();

let serverReady = false;

const app = express();
// NOTE(jwetzell): load socket.io admin-ui on /ui
app.use('/ui', express.static(path.join(__dirname, '../node_modules/@socket.io/admin-ui/ui/dist')));
app.get('/ready', (req, res) => {
  res.statusCode = serverReady ? 200 : 503;
  res.send();
});

const httpServer = createServer(app);

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

if (process.env.REDIS_URL) {
  logger.info('cloud: socket io server being started with redis');
  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient
    .connect()
    .then(() => {
      io.adapter(createAdapter(redisClient));
      serverReady = true;
    })
    .catch((error) => {
      logger.error('cloud: failed to connect to redis');
      logger.error(error);
    });
} else {
  logger.info('cloud: socket io server being started without redis');
  serverReady = true;
}

io.of('/').adapter.on('join-room', (room, id) => {
  logger.debug(`cloud: socket ${id} joined room ${room}`);
  // sendToDiscord(`socket ${id} joined room ${room}`);
});

io.of('/').adapter.on('leave-room', (room, id) => {
  logger.debug(`cloud: socket ${id} left room ${room}`);
  // sendToDiscord(`socket ${id} joined room ${room}`);
});

io.on('connection', (socket) => {
  logger.info(`cloud: socket ${socket.id} connected`);
  sendToDiscord(`socket ${socket.id} connected`);
  socket.on('join', (rooms) => {
    if (rooms) {
      if (Array.isArray(rooms)) {
        socket.join(rooms);
      }
    }
  });

  socket.on('send', (room, msgObj) => {
    io.to(room).emit('message', msgObj);
  });

  socket.on('disconnect', () => {
    sendToDiscord(`socket ${socket.id} disconnected`);
    logger.info(`cloud: socket ${socket.id} disconnected`);
  });
});

const listenPort = process.env.PORT ? process.env.PORT : 8888;
httpServer.listen(listenPort);
