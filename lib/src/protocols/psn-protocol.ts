import { Decoder } from '@jwetzell/posistagenet';
import { UDPSender } from '@showbridge/types';
import { PSNProtocolParams } from '@showbridge/types/dist/models/params/protocols.js';
import { createSocket, Socket } from 'dgram';
import PSNMessage from '../messages/psn-message.js';
import { disabled, logger } from '../utils/index.js';
import Protocol from './protocol.js';

class PSNProtocol extends Protocol<PSNProtocolParams> {
  server: Socket;
  stopped: boolean;
  decoders: Map<string, Decoder> = new Map<string, Decoder>();

  reload(params) {
    if (this.server !== undefined) {
      this.server.close();
      delete this.server;
    }
    this.server = createSocket('udp4');

    this.server.bind(
      {
        address: params.address ? params.address : '0.0.0.0',
        port: params.port ? params.port : 56565,
      },
      () => {
        this.stopped = false;
        this.server.addMembership('236.10.10.10');

        logger.debug(`psn: server setup on port ${this.server.address().address}:${this.server.address().port}`);
        this.server.on('message', (msg, rinfo) => {
          const sender: UDPSender = {
            protocol: 'udp',
            address: rinfo.address,
            port: rinfo.port,
          };

          if (!this.decoders.has(sender.address)) {
            this.decoders.set(sender.address, new Decoder());
          }

          // NOTE(jwetzell): starts with a '/' or #bundle

          this.decoders.get(sender.address).decode(msg);
          const message = new PSNMessage(this.decoders.get(sender.address), sender);
          // console.log(message);

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

  send(msg: Buffer, port: number, host: string) {
    if (this.server === undefined) {
      logger.error('psn: server no longer exists');
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
      enabled: !disabled.protocols.has('psn'),
      listening: !this.stopped,
      address: this.server ? this.server.address() : {},
    };
  }
}
export default PSNProtocol;
