const { io } = require('socket.io-client');
const { EventEmitter } = require('events');
const { logger } = require('../utils/helper');
const MIDIMessage = require('../messages/midi-message');
const UDPMessage = require('../messages/udp-message');
const TCPMessage = require('../messages/tcp-message');
const OSCMessage = require('../messages/osc-message');
const MQTTMessage = require('../messages/mqtt-message');
const WebSocketMessage = require('../messages/websocket-message');
const HTTPMessage = require('../messages/http-message');

class CloudServer extends EventEmitter {
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
      logger.error(error);
    });

    this.socket.on('connect', () => {
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
          switch (msgObj.messageType) {
            case 'udp':
              message = UDPMessage.fromJSON(msgObj);
              break;
            case 'tcp':
              message = TCPMessage.fromJSON(msgObj);
              break;
            case 'osc':
              message = OSCMessage.fromJSON(msgObj);
              break;
            case 'midi':
              message = MIDIMessage.fromJSON(msgObj);
              break;
            case 'ws':
              message = WebSocketMessage.fromJSON(msgObj);
              break;
            case 'http':
              message = HTTPMessage.fromJSON(msgObj);
              break;
            case 'mqtt':
              message = MQTTMessage.fromJSON(msgObj);
              break;
            default:
              logger.error(`cloud: unhandled message type = ${msgObj.messageType}`);
              break;
          }
          if (message) {
            this.emit('message', message);
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

    this.emit('send', { room, message });
  }
}

module.exports = CloudServer;
