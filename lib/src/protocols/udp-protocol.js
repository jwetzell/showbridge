import udp from 'dgram';
import { EventEmitter } from 'events';
import osc from 'osc-min';
import { OSCMessage, UDPMessage } from '../messages/index.js';
import { disabled, logger } from '../utils/index.js';

class UDPProtocol extends EventEmitter {
  constructor() {
    super();
    this.oscBundleTag = Buffer.from('#bundle');
  }

  reload(params) {
    if (this.server !== undefined) {
      this.server.close();
      delete this.server;
    }
    this.server = udp.createSocket('udp4');
    this.server.bind(
      {
        address: params.address ? params.address : '0.0.0.0',
        port: params.port,
      },
      () => {
        this.stopped = false;
        logger.debug(`udp: server setup on port ${this.server.address().address}:${this.server.address().port}`);
        this.server.on('message', (msg, rinfo) => {
          const sender = {
            protocol: 'udp',
            address: rinfo.address,
            port: rinfo.port,
          };

          let message;

          // NOTE(jwetzell): starts with a '/' or #bundle
          if (msg[0] === 0x2f || msg.includes(this.oscBundleTag)) {
            try {
              message = new OSCMessage(osc.fromBuffer(msg, true), sender);
            } catch (error) {
              message = new UDPMessage(msg, sender);
            }
          } else {
            message = new UDPMessage(msg, sender);
          }
          this.emit('messageIn', message);
        });
        this.emit('started');
      }
    );

    this.server.on('close', () => {
      this.stopped = true;
      this.emit('stopped');
    });
  }

  send(msg, port, host) {
    if (this.server === undefined) {
      logger.error('udp: server no longer exists');
      return;
    }

    this.server.send(msg, port, host);
  }

  stop() {
    if (this.server) {
      this.server.close();
    } else {
      this.emit('stopped');
    }
  }

  get status() {
    return {
      enabled: !disabled.protocols.has('udp'),
      listening: !this.stopped,
      address: this.server ? this.server.address() : {},
    };
  }
}
export default UDPProtocol;
