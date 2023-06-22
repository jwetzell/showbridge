const events = require('events');
const net = require('net');
const osc = require('osc-min');
const OscMessage = require('../models/message/osc-message');
const TCPMessage = require('../models/message/tcp-message');

class TCPServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(params) {
    if (this.server) {
      this.server.close();
    }
    this.server = net.createServer();
    this.server.on('connection', (conn) => {
      conn.on('data', (msg) => {
        const sender = {
          protocol: 'tcp',
          address: conn.remoteAddress,
          port: conn.remotePort,
        };
        try {
          const oscMsg = new OscMessage(osc.fromBuffer(msg, true), sender);
          this.eventEmitter.emit('message', oscMsg, 'osc');
        } catch (error) {
          const tcpMsg = new TCPMessage(msg, sender);
          this.eventEmitter.emit('message', tcpMsg, 'tcp');
        }
      });
    });

    this.server.listen(params.port, () => {
      console.info(`tcp server setup on port ${this.server.address().port}`);
    });
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = TCPServer;
