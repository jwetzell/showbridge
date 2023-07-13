const { Server } = require('ws');
const events = require('events');
const { noop } = require('lodash');
const WebSocketMessage = require('../messages/websocket-message');

class WebSocketServer {
  constructor(server) {
    this.eventEmitter = new events.EventEmitter();

    this.server = new Server({
      server,
    });

    this.server.on('connection', (ws, req) => {
      ws.on('message', (msgBuffer) => {
        // extract some key request properties
        const wsMsg = new WebSocketMessage(msgBuffer, {
          protocol: 'tcp',
          address: req.socket?.remoteAddress,
          port: req.socket?.remotePort,
        });
        this.eventEmitter.emit('message', wsMsg);
      });
    });
  }

  reload() {
    noop();
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = WebSocketServer;
