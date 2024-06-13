#!/usr/bin/env node

import { instrument } from '@socket.io/admin-ui';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Redis } from 'ioredis';
import path from 'node:path';
import { Server } from 'socket.io';
import { logger, sendToDiscord } from './utils.js';

let serverReady = false;

const app = express();
// NOTE(jwetzell): load socket.io admin-ui on /ui
app.use('/ui', express.static(path.join(import.meta.dirname, '../node_modules/@socket.io/admin-ui/ui/dist')));
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
  const redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on('connect', () => {
    io.adapter(createAdapter(redisClient, { maxLen: 50000 }));
    serverReady = true;
    logger.info('cloud: connected to redis server');
  });

  redisClient.on('error', (error) => {
    logger.error('cloud: failed to connect to redis');
    logger.error(error);
  });
} else {
  logger.info('cloud: socket io server being started without redis');
  serverReady = true;
}

io.of('/').adapter.on('join-room', (room, id) => {
  logger.debug(`cloud: socket ${id} joined room ${room}`);
  sendToDiscord('join', `socket ${id} joined room ${room}`);
});

io.of('/').adapter.on('leave-room', (room, id) => {
  logger.debug(`cloud: socket ${id} left room ${room}`);
  sendToDiscord('leave', `socket ${id} left room ${room}`);
});

io.on('connection', (socket) => {
  logger.info(`cloud: socket ${socket.id} connected`);
  sendToDiscord('connect', `socket ${socket.id} connected`);
  socket.on('join', (rooms) => {
    if (rooms) {
      if (Array.isArray(rooms)) {
        socket.join(rooms);
      }
    }
  });

  socket.on('send', (room, msgObj, callback) => {
    io.to(room).emit('message', msgObj);

    if (callback) {
      callback(Date.now());
    }
  });

  socket.on('ping', (callback) => {
    callback(Date.now());
  });

  socket.on('disconnect', () => {
    sendToDiscord('disconnect', `socket ${socket.id} disconnected`);
    logger.info(`cloud: socket ${socket.id} disconnected`);
  });
});

const listenPort = process.env.PORT ? process.env.PORT : 8888;
httpServer.listen(listenPort);
