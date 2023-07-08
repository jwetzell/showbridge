const events = require('events');
const net = require('net');
const osc = require('osc-min');
const slip = require('slip');
const OSCMessage = require('../models/message/osc-message');
const TCPMessage = require('../models/message/tcp-message');
const { logger } = require('../utils/helper');
class TCPServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
    this.sockets = {};
  }

  reload(params) {
    if (this.server) {
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
          //TODO(jwetzell): SLIP decoding
          const oscMsg = new OSCMessage(osc.fromBuffer(msg, true), sender);
          this.eventEmitter.emit('message', oscMsg, 'osc');
        } catch (error) {
          const tcpMsg = new TCPMessage(msg, sender);
          this.eventEmitter.emit('message', tcpMsg, 'tcp');
        }
      });
    });

    this.server.on('error', (err) => {
      logger.error(`tcp: problem starting TCP server: ${err.message}`);
    });

    this.server.listen(
      {
        host: params.address,
        port: params.port,
      },
      () => {
        logger.info(`tcp: server setup on port ${this.server.address().address}:${this.server.address().port}`);
      }
    );
  }

  send(msg, port, host, slipEncode) {
    const msgToSend = slipEncode ? slip.encode(msg) : msg;

    if (this.sockets[host] === undefined) {
      this.sockets[host] = {};
    }

    if (this.sockets[host][port] === undefined) {
      this.sockets[host][port] = new net.Socket();
      this.sockets[host][port].connect(port, host, () => {
        logger.debug(`tcp: connected to client`);
      });

      this.sockets[host][port].on('error', (err) => {
        logger.error('tcp: client error');
        logger.error(err);
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

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = TCPServer;
