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

class BridgeServer {
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  reload(params) {
    if (this.socket !== undefined) {
      this.socket.close();
    }

    if (params.url) {
      this.socket = io(params.url);

      this.socket.on('connect', () => {
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
                logger.error(`bridge: unhandled message type = ${msgObj.messageType}`);
                break;
            }
            if (message) {
              this.eventEmitter.emit('message', message);
            }
          }
        });
      });
    }
  }

  send(room, message) {
    if (this.socket !== undefined && this.socket.connected) {
      if (message.toJSON !== undefined) {
        const messageToSend = message.toJSON();
        if (messageToSend !== undefined) {
          logger.debug(`bridge: forwarding ${message.messageType} message to room ${room}`);
          this.socket.emit('send', room, messageToSend);
        } else {
          logger.error(`bridge: unsupported message type: ${message.messageType}`);
        }
      } else {
        logger.error(`bridge: unsupported message type: ${message.messageType}`);
      }
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = BridgeServer;
