const { Server } = require('ws');
const { EventEmitter } = require('events');
const { noop } = require('lodash');
const WebSocketMessage = require('../messages/websocket-message');

class WebSocketServer extends EventEmitter {
  constructor(server) {
    super();

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
        this.emit('message', wsMsg);
      });
    });
  }

  reload() {
    noop();
  }
}

module.exports = WebSocketServer;
