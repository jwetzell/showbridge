const events = require('events');
const net = require('net');
const osc = require('osc-min');
const OscMessage = require('../models/message/osc-message');

class TCPServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(port) {
    if (this.server) {
      this.server.close();
    }
    this.server = net.createServer();
    this.server.on('connection', (conn) => {
      conn.on('data', onConnData);

      function onConnData(msg) {
        try {
          const oscMsg = new OscMessage(osc.fromBuffer(msg, true), {
            protocol: 'tcp',
            address: conn.remoteAddress,
            port: conn.remotePort,
          });
          this.eventEmitter.emit('message', oscMsg, 'osc');
        } catch (error) {
          console.error('PROBLEM PROCESSING MESSAGE');
          console.error(error);
        }
      }
    });

    this.server.listen(port, () => {
      console.info(`tcp server setup on port ${this.server.address().port}`);
    });
  }
}

module.exports = TCPServer;
