const events = require('events');
const udp = require('dgram');
const osc = require('osc-min');
const OSCMessage = require('../models/message/osc-message');
const UDPMessage = require('../models/message/udp-message');
const { logger } = require('../utils/helper');
class UDPServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
  }

  reload(params) {
    if (this.server !== undefined) {
      this.server.close();
    }
    this.server = udp.createSocket('udp4');
    this.server.bind(
      {
        address: params.address,
        port: params.port,
      },
      () => {
        logger.debug(`udp: server setup on port ${this.server.address().address}:${this.server.address().port}`);
        this.server.on('message', (msg, rinfo) => {
          const sender = {
            protocol: 'udp',
            address: rinfo.address,
            port: rinfo.port,
          };

          let message;

          try {
            message = new OSCMessage(osc.fromBuffer(msg, true), sender);
          } catch (error) {
            message = new UDPMessage(msg, sender);
          }
          this.eventEmitter.emit('message', message);
        });
      }
    );
  }

  send(msg, port, host) {
    if (this.server !== undefined) {
      this.server.send(msg, port, host);
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = UDPServer;
