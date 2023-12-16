import { EventEmitter } from 'events';
import net from 'net';
import osc from 'osc-min';
import slip from 'slip';
import { OSCMessage, TCPMessage } from '../messages/index.js';
import { disabled, logger } from '../utils/index.js';

class TCPProtocol extends EventEmitter {
  constructor() {
    super();
    this.oscBundleTag = Buffer.from('#bundle');
    this.sockets = {};
  }

  #handleSlipMessage(msg, sender) {
    let message;
    if (msg[0] === 0x2f || msg.includes(this.oscBundleTag)) {
      try {
        message = new OSCMessage(osc.fromBuffer(msg, true), sender);
      } catch (error) {
        message = new TCPMessage(msg, sender);
      }
    } else {
      message = new TCPMessage(msg, sender);
    }
    if (message) {
      this.emit('messageIn', message);
    }
  }

  reload(params) {
    if (this.server !== undefined) {
      this.server.close();
      delete this.server;
    }
    this.server = net.createServer();
    this.server.on('connection', (conn) => {
      const sender = {
        protocol: 'tcp',
        address: conn.remoteAddress,
        port: conn.remotePort,
      };

      const connectionSlipDecoder = new slip.Decoder({
        onMessage: (msg) => {
          this.#handleSlipMessage(msg, sender);
        },
        maxMessageSize: 209715200,
        bufferSize: 2048,
      });

      conn.on('data', (msg) => {
        let message;
        // NOTE(jwetzell): starts with a '/' or #bundle
        if (msg[0] === 0x2f || msg.includes(this.oscBundleTag)) {
          try {
            message = new OSCMessage(osc.fromBuffer(msg, true), sender);
          } catch (error) {
            message = new TCPMessage(msg, sender);
          }
        } else if (msg[0] === 0xc0) {
          // TODO(jwetzell): detect more proper slip encoded messages
          connectionSlipDecoder.decode(msg);
        } else {
          message = new TCPMessage(msg, sender);
        }
        if (message) {
          this.emit('messageIn', message);
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
      if (this.server.listening) {
        this.server.close();
      } else {
        this.emit('stopped');
      }
    } else {
      this.emit('stopped');
    }
  }

  get status() {
    return {
      enabled: !disabled.protocols.has('tcp'),
      listening: this.server ? this.server.listening : false,
      address: this.server ? this.server.address() : {},
    };
  }
}

export default TCPProtocol;
