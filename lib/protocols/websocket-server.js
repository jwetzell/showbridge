const { Server } = require('ws');
const { EventEmitter } = require('events');
const { noop } = require('lodash');
const WebSocketMessage = require('../messages/websocket-message');

class WebSocketServer extends EventEmitter {
  constructor(server) {
    super();

    this.webUISockets = []

    this.server = new Server({
      server,
    });

    this.server.on('connection', (ws, req) => {
      if(ws.protocol === 'webui'){
        this.webUISockets.push(ws)
      }else{   
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

  sendToWebUISockets(eventType,data){
    this.webUISockets.forEach((socket)=>{
      socket.send(
        JSON.stringify({
          eventType,
          data
        })
      )
    })
  }

  reload() {
    noop();
  }

  stop() {
    noop();
  }
}

module.exports = WebSocketServer;
