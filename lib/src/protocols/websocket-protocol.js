import { EventEmitter } from 'events';
import { WebSocketServer as Server } from 'ws';
import { WebSocketMessage } from '../messages/index.js';
import { disabled } from '../utils/index.js';

class WebSocketProtocol extends EventEmitter {
  constructor(router) {
    super();
    this.router = router;

    this.webUISockets = [];
    this.openWebSockets = [];

    this.server = new Server({
      noServer: true,
    });

    this.server.on('connection', (ws, req) => {
      const webUISocket = ws;
      if (webUISocket.protocol === 'webui') {
        // NOTE(jwetzell): this setups the websocket protocol for the webui
        // storing the socket for later reference and not setting the usual message listener
        this.webUISockets.push(webUISocket);
        webUISocket.onclose = () => {
          const socketIndex = this.webUISockets.indexOf(webUISocket);
          if (socketIndex > -1) {
            this.webUISockets.splice(socketIndex, 1);
          }
        };
        webUISocket.on('message', (msgBuffer) => {
          const wsMsg = new WebSocketMessage(msgBuffer, {
            protocol: 'tcp',
            address: req.socket?.remoteAddress,
            port: req.socket?.remotePort,
          });

          if (wsMsg.payload !== undefined) {
            if (wsMsg.payload.eventName === 'getProtocolStatus') {
              this.emit('getProtocolStatus', webUISocket);
            } else if (wsMsg.payload.eventName === 'runAction') {
              if (wsMsg.payload.data) {
                // TODO(jwetzell) error handling here?
                this.emit('runAction', wsMsg.payload.data.action, wsMsg.payload.data.msg, wsMsg.payload.data.vars);
              }
            }
          }
        });
      } else {
        const webSocketConnection = ws;
        this.openWebSockets.push(webSocketConnection);
        webSocketConnection.onclose = () => {
          const socketIndex = this.openWebSockets.indexOf(webUISocket);
          if (socketIndex > -1) {
            this.openWebSockets.splice(socketIndex, 1);
          }
        };
        webSocketConnection.on('message', (msgBuffer) => {
          // NOTE(jwetzell): extract some key request properties
          const wsMsg = new WebSocketMessage(msgBuffer, {
            protocol: 'tcp',
            address: req.socket?.remoteAddress,
            port: req.socket?.remotePort,
          });
          this.emit('messageIn', wsMsg);
        });
      }
    });
  }

  handleUpgrade(req, socket, head) {
    this.server.handleUpgrade(req, socket, head, (ws) => {
      this.server.emit('connection', ws, req);
    });
  }

  sendToWebUISockets(eventName, data) {
    this.webUISockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          eventName,
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
    this.emit('started');
  }

  stop() {
    // NOTE(jwetzell): close all web sockets
    this.webUISockets.forEach((socket) => {
      socket.close();
    });

    this.openWebSockets.forEach((socket) => {
      socket.close();
    });

    this.emit('stopped');
  }

  get status() {
    return {
      enabled: !disabled.protocols.has('ws'),
      listening: !!this.server,
    };
  }
}

export default WebSocketProtocol;
