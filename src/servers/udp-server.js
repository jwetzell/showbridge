const events = require('events');
const udp = require('dgram');
const osc = require('osc-min');
const OSCMessage = require('../models/message/osc-message');
const UDPMessage = require('../models/message/udp-message');

class UDPServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(params) {
    if (this.server) {
      this.server.close();
    }
    this.server = udp.createSocket('udp4');
    this.server.bind(params.port, () => {
      console.info(`udp server setup on port ${this.server.address().port}`);
      this.server.on('message', (msg, rinfo) => {
        const sender = {
          protocol: 'udp',
          address: rinfo.address,
          port: rinfo.port,
        };
        try {
          const oscMsg = new OSCMessage(osc.fromBuffer(msg, true), sender);
          this.eventEmitter.emit('message', oscMsg, 'osc');
        } catch (error) {
          console.error(error);
          const udpMsg = new UDPMessage(msg, sender);
          this.eventEmitter.emit('message', udpMsg, 'udp');
        }
      });
    });
  }

  send(msg, port, host) {
    if (this.server) {
      this.server.send(msg, port, host);
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = UDPServer;
