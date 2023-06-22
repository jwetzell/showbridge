const events = require('events');
const udp = require('dgram');
const osc = require('osc-min');
const OscMessage = require('../models/message/osc-message');

class UDPServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(port) {
    if (this.server) {
      this.server.close();
    }
    this.server = udp.createSocket('udp4');
    this.server.bind(port, () => {
      console.info(`udp server setup on port ${this.server.address().port}`);
      this.server.on('message', (msg, rinfo) => {
        try {
          const oscMsg = new OscMessage(osc.fromBuffer(msg, true), {
            protocol: 'udp',
            address: rinfo.address,
            port: rinfo.port,
          });
          this.eventEmitter.emit('message', oscMsg, 'osc');
        } catch (error) {
          console.error('PROBLEM PROCESSING OSC MESSAGE');
          console.error(error);
        }
      });
    });
  }

  send(msg, port, host) {
    if (this.server) {
      this.server.send(msg, port, host);
    }
  }
}

module.exports = UDPServer;
