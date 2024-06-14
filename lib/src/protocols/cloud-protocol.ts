import { Router } from 'express';
import { has } from 'lodash-es';
import { EventEmitter } from 'node:events';
import { io, Socket } from 'socket.io-client';
import { Message, MessageTypeClassMap } from '../messages/index.js';
import { logger } from '../utils/index.js';

class CloudProtocol extends EventEmitter {
  router: Router;
  socket: Socket;
  roundtripMs: number;

  constructor(router) {
    super();
    this.router = router;
    setInterval(() => {
      if (this.socket) {
        const timeSent = Date.now();
        this.socket.emit('ping', (serverTimestamp) => {
          this.roundtripMs = serverTimestamp - timeSent;
        });
      }
    }, 5000);
  }

  reload(params) {
    if (this.socket !== undefined) {
      this.socket.close();
      delete this.socket;
    }

    if (params.url === undefined || params.url === '') {
      logger.debug('cloud: no url provided skipping setup');
      this.emit('started');
      return;
    }

    this.socket = io(params.url, {
      transports: ['websocket'],
    });

    this.socket.on('connect_error', (error) => {
      logger.error(`cloud: unable to connect to ${params.url}`);
      logger.error(error.message);
    });

    this.socket.on('connect', () => {
      this.socket.io.engine.on('close', () => {
        this.emit('stopped');
      });

      logger.debug(`cloud: cloud instance ${params.url} joined`);
      this.emit('started');
      if (params.rooms) {
        this.socket.emit('join', params.rooms);
      }
    });

    this.socket.on('message', (msgObj) => {
      if (msgObj.messageType) {
        let message;

        if (has(MessageTypeClassMap, msgObj.messageType)) {
          message = MessageTypeClassMap[msgObj.messageType].fromJSON(msgObj);
        } else {
          logger.error(`cloud: unhandled message type = ${msgObj.messageType}`);
        }

        if (message) {
          this.emit('messageIn', message);
        }
      }
    });
  }

  send(room: string, message: Message) {
    if (this.socket === undefined) {
      logger.error('cloud: connection does not seem to be setup');
      return;
    }

    if (!this.socket.connected) {
      logger.error('cloud: connection to cloud is broken');
      return;
    }

    if (message.toJSON === undefined) {
      logger.error('cloud: message type is not configured correctly for cloud support');
      return;
    }

    const messageToSend = message.toJSON();

    if (messageToSend === undefined) {
      logger.error(`cloud: unsupported message type: ${message.messageType}`);
      return;
    }

    logger.debug(`cloud: forwarding ${message.messageType} message to room ${room}`);
    const timeSent = Date.now();
    this.socket.emit('send', room, messageToSend, (serverTimestamp) => {
      this.roundtripMs = serverTimestamp - timeSent;
    });
  }

  stop() {
    if (this.socket) {
      if (this.socket.connected) {
        this.socket.close();
      } else {
        this.emit('stopped');
      }
    } else {
      this.emit('stopped');
    }
  }

  get status() {
    const status = {
      enabled: true,
      connected: this.socket?.connected !== undefined ? this.socket.connected : false,
      id: this.socket?.id,
      roundtripMs: this.roundtripMs,
    };
    return status;
  }
}

export default CloudProtocol;
