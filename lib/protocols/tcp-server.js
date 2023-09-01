import { EventEmitter } from 'events';
import net from 'net';
import osc from 'osc-min';
import slip from 'slip';
import { OSCMessage, TCPMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';

class TCPServer extends EventEmitter {
  constructor() {
    super();
    this.sockets = {};
  }

  reload(params) {
    if (this.server !== undefined) {
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
          // TODO(jwetzell): SLIP decoding
          const oscMsg = new OSCMessage(osc.fromBuffer(msg, true), sender);
          this.emit('message', oscMsg);
        } catch (error) {
          const tcpMsg = new TCPMessage(msg, sender);
          this.emit('message', tcpMsg);
        }
      });
    });

    this.server.on('error', (error) => {
      logger.error(`tcp: problem starting TCP server - ${error}`);
    });

    this.server.listen(
      {
        host: params.address ? params.address : '0.0.0.0',
        port: params.port,
      },
      () => {
        logger.debug(`tcp: server setup on port ${this.server.address().address}:${this.server.address().port}`);
      }
    );
    this.server.on('close', () => {
      this.emit('stopped');
    });
  }

  send(msg, port, host, slipEncode) {
    const msgToSend = slipEncode ? slip.encode(msg) : msg;

    // NOTE(jwetzell): keep around sockets for any tcp host:port connection we've made so far
    if (this.sockets[host] === undefined) {
      this.sockets[host] = {};
    }

    if (this.sockets[host][port] === undefined) {
      this.sockets[host][port] = new net.Socket();
      this.sockets[host][port].connect(port, host, () => {
        logger.trace('tcp: connected to client');
      });

      // NOTE(jwetzell): when a tcp client errors out get rid of it (will be recreated next send to host:port)
      this.sockets[host][port].on('error', (error) => {
        logger.error(`tcp: client error - ${error}`);
        this.sockets[host][port].destroy();
        this.sockets[host][port] = undefined;
      });

      this.sockets[host][port].on('close', () => {
        logger.debug('tcp: disconnected from client');
        delete this.sockets[host][port];
      });
    }
    this.sockets[host][port].write(msgToSend);
    this.emit('send', { msg, port, host, slipEncode });
  }

  stop() {
    Object.keys(this.sockets).forEach((host) => {
      Object.keys(this.sockets[host]).forEach((port) => {
        if (this.sockets[host][port]) {
          this.sockets[host][port].close();
        }
      });
    });
    if (this.server) {
      this.server.close();
    }
  }

  // TODO(jwetzell): fill this out
  get status() {
    return {};
  }
}

export default TCPServer;
