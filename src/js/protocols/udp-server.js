const { EventEmitter } = require('events');
const udp = require('dgram');
const osc = require('osc-min');
const OSCMessage = require('../messages/osc-message');
const UDPMessage = require('../messages/udp-message');
const { logger } = require('../utils/helper');

class UDPServer extends EventEmitter {
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
          this.emit('message', message);
        });
      }
    );
  }

  send(msg, port, host) {
    if (this.server === undefined) {
      logger.error('udp: server no longer exists');
      return;
    }

    this.server.send(msg, port, host);
    this.emit('send', { msg, port, host });
  }
}

module.exports = UDPServer;
