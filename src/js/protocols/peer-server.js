const { io } = require('socket.io-client');
const { EventEmitter } = require('events');
const { logger } = require('../utils/helper');
const MIDIMessage = require('../messages/midi-message');

class PeerServer {
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  reload(params) {
    if (this.socket !== undefined) {
      this.socket.close();
    }

    this.socket = io(params.url);

    this.socket.on('connect', () => {
      this.socket.emit('join', params.room);
      this.socket.on('message', (msgType, bytes) => {
        logger.info(`receieved ${msgType} message from bridge`);
        switch (msgType) {
          case 'midi':
            this.eventEmitter.emit('message', new MIDIMessage(bytes, 'bridge'));
            break;
          default:
            logger.error(`peer: unhandled message type = ${msgType}`);
            break;
        }
      });
    });
  }

  send(room, message) {
    logger.info(`forwarding ${message.messageType} message to room ${room}`);
    if (this.socket !== undefined && this.socket.connected) {
      this.socket.emit('send', room, message.messageType, message.bytes);
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = PeerServer;
