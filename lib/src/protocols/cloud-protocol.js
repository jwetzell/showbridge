import { EventEmitter } from 'events';
import { has } from 'lodash-es';
import { io } from 'socket.io-client';
import { MessageTypeClassMap, logger } from '../utils/index.js';

class CloudProtocol extends EventEmitter {
  reload(params) {
    if (this.socket !== undefined) {
      this.socket.close();
    }

    if (params.url === undefined || params.url === '') {
      logger.debug('cloud: no url provided skipping setup');
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

      if (params.rooms) {
        this.socket.emit('join', params.rooms);
      }

      if (params.room) {
        this.socket.emit('join', [params.room]);
      }

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
    });
  }

  send(room, message) {
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
    this.socket.emit('send', room, messageToSend);

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
    };
    return status;
  }
}

export default CloudProtocol;
