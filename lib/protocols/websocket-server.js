const { Server } = require('ws');
const { EventEmitter } = require('events');
const { noop } = require('lodash');
const WebSocketMessage = require('../messages/websocket-message');

class WebSocketServer extends EventEmitter {
  constructor() {
    super();

    this.webUISockets = [];

    this.server = new Server({
      noServer: true,
    });

    this.server.on('connection', (ws, req) => {
      const webUISocket = ws;
      if (webUISocket.protocol === 'webui') {
        // this setups the websocket protocol for the webui storing the socket for later reference
        // and not setting the usual message listener
        this.webUISockets.push(webUISocket);
        webUISocket.onclose = () => {
          const socketIndex = this.webUISockets.indexOf(webUISocket);
          if (socketIndex > -1) {
            this.webUISockets.splice(socketIndex, 1);
          }
        };
      } else {
        ws.on('message', (msgBuffer) => {
          // extract some key request properties
          const wsMsg = new WebSocketMessage(msgBuffer, {
            protocol: 'tcp',
            address: req.socket?.remoteAddress,
            port: req.socket?.remotePort,
          });
          this.emit('message', wsMsg);
        });
      }
    });
  }

  handleUpgrade(req, socket, head) {
    this.server.handleUpgrade(req, socket, head, (ws) => {
      this.server.emit('connection', ws, req);
    });
  }

  sendToWebUISockets(eventType, data) {
    this.webUISockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          eventType,
          data,
        })
      );
    });
  }

  reload() {
    if (this.webUISockets.length > 0) {
      this.webUISockets.forEach((webUISocket) => {
        webUISocket.close();
      });
    }
    noop();
  }

  stop() {
    noop();
  }
}

module.exports = WebSocketServer;
