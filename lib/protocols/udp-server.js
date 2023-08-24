import { EventEmitter } from 'events';
import udp from 'dgram';
import osc from 'osc-min';
import { OSCMessage, UDPMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';

class UDPServer extends EventEmitter {
  reload(params) {
    if (this.server !== undefined) {
      this.server.close();
    }
    this.server = udp.createSocket('udp4');
    this.server.bind(
      {
        address: params.address ? params.address : '0.0.0.0',
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

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

export default UDPServer;
