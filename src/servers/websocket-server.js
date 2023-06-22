const { Server } = require('ws');
const events = require('events');
const WebSocketMessage = require('../models/message/websocket-message');

class WebSocketServer {
  constructor(server) {
    this.eventEmitter = new events.EventEmitter();

    this.server = new Server({
      server,
    });

    this.server.on('connection', (ws, req) => {
      ws.on('message', (msgBuffer) => {
        const msg = new WebSocketMessage(msgBuffer, req.connection);
        this.eventEmitter.emit('message', msg, 'ws');
      });
    });
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = WebSocketServer;
