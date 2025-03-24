import cors from 'cors';
import express, { Application } from 'express';
import http, { IncomingMessage, Server, ServerResponse } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

import { HTTPProtocolParams } from '@showbridge/types/dist/models/params/protocols.js';
import { get, has, set } from 'lodash-es';
import { AddressInfo } from 'net';
import superagent from 'superagent';
import Config from '../config.js';
import { HTTPMessage, WebSocketMessage } from '../messages/index.js';
import { WebUIPayload } from '../messages/websocket-message.js';
import { disabled, logger } from '../utils/index.js';
import Protocol from './protocol.js';

class HTTPProtocol extends Protocol<HTTPProtocolParams> {
  app: Application;
  httpServer: Server<typeof IncomingMessage, typeof ServerResponse>;
  wsServer: WebSocketServer;
  webUISockets: WebSocket[];
  openWebSockets: WebSocket[];
  server: Server<typeof IncomingMessage, typeof ServerResponse>;

  constructor(protocolObj, router) {
    super(protocolObj, router);

    this.app = express();
    this.httpServer = http.createServer(this.app);

    this.setupWebSocket();

    // Express Server
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.raw());
    this.app.use(express.text());

    // eslint-disable-next-line consistent-return
    this.app.use((err, req, res, next) => {
      if (err instanceof SyntaxError && res.status === 400 && 'body' in err) {
        return res.status(400).send({
          msg: err.message,
          errorType: 'invalid_body',
        });
      }
      next();
    });

    this.app.get('/config', (req, res) => {
      res.send(this.router.config);
    });

    this.app.get('/config/schema', (req, res) => {
      res.send(this.router.config.schema);
    });

    this.app.post('/config', (req, res) => {
      try {
        const configToUpdate = new Config(req.body, this.router.config.schema);
        // TODO(jwetzell): handle errors on the reload and send them back
        this.emit('configUploaded', configToUpdate);
        this.router.config = configToUpdate;
        res.status(200).send({ msg: 'config reloaded check console for any errors' });
      } catch (error) {
        logger.error(error);
        res.status(400).send({
          msg: 'invalid config',
          errorType: 'config_validation',
          errors: error,
        });
      }
    });

    this.app.get('/vars*', (req, res) => {
      if (req.path === '/vars') {
        res.send(this.router.vars);
      } else {
        const varsKey = req.path.replace('/vars/', '').replaceAll('/', '.');
        if (has(this.router.vars, varsKey)) {
          res.send(get(this.router.vars, varsKey));
        } else {
          res.status(404).send({
            msg: `no value found at vars.${varsKey}`,
            errorType: 'vars_key',
          });
        }
      }
    });

    this.app.post('/vars*', (req, res) => {
      if (req.path === '/vars') {
        this.router.vars = req.body;
        this.router.emit('varsUpdated', this.router.vars);
        res.status(200).send({ msg: 'vars updated' });
      } else {
        const varsKey = req.path.replace('/vars/', '').replaceAll('/', '.');
        if (varsKey !== '') {
          set(this.router.vars, varsKey, req.body);
          this.router.emit('varsUpdated', this.router.vars);
          res.status(200).send({ msg: `vars.${varsKey} updated` });
        }
      }
    });

    // TODO(jwetzell): error handling on these endpoints
    // TODO(jwetzell): ability for user to control the HTTP responses
    this.app.get('/*', (req, res) => {
      const parsedHTTP = new HTTPMessage(req, res);
      this.emit('messageIn', parsedHTTP);
      try {
        res.status(200).send({ msg: 'ok' });
      } catch (error) {
        logger.trace('http: default message supressed likely from http-response action');
      }
    });

    this.app.post('/*', (req, res) => {
      const parsedHTTP = new HTTPMessage(req, res);
      this.emit('messageIn', parsedHTTP);
      try {
        res.status(200).send({ msg: 'ok' });
      } catch (error) {
        logger.trace('http: default message supressed likely from http-response action');
      }
    });

    this.httpServer.on('clientError', (error) => {
      logger.error(error);
    });
  }

  setupWebSocket() {
    this.webUISockets = [];
    this.openWebSockets = [];
    this.wsServer = new WebSocketServer({
      noServer: true,
    });

    this.wsServer.on('connection', (ws, req) => {
      if (ws.protocol === 'webui') {
        const webUISocket = ws;
        // NOTE(jwetzell): this setups the websocket protocol for the webui
        // storing the socket for later reference and not setting the usual message listener
        this.webUISockets.push(webUISocket);
        webUISocket.onclose = () => {
          const socketIndex = this.webUISockets.indexOf(webUISocket);
          if (socketIndex > -1) {
            this.webUISockets.splice(socketIndex, 1);
          }
        };
        webUISocket.on('message', (msgBuffer) => {
          const wsMsg = new WebSocketMessage(msgBuffer, {
            protocol: 'tcp',
            address: req.socket?.remoteAddress,
            port: req.socket?.remotePort,
          });

          if (wsMsg.payload !== undefined && typeof wsMsg.payload === 'object') {
            const webUIPayload = wsMsg.payload as WebUIPayload;
            if (webUIPayload.eventName === 'getProtocolStatus') {
              this.emit('getProtocolStatus', webUISocket);
            } else if (webUIPayload.eventName === 'runAction') {
              if (webUIPayload.data) {
                // TODO(jwetzell) error handling here?
                this.emit('runAction', webUIPayload.data.action, webUIPayload.data.msg, webUIPayload.data.vars);
              }
            }
          }
        });
      } else {
        const webSocketConnection = ws;
        this.openWebSockets.push(webSocketConnection);
        webSocketConnection.onclose = () => {
          const socketIndex = this.openWebSockets.indexOf(ws);
          if (socketIndex > -1) {
            this.openWebSockets.splice(socketIndex, 1);
          }
        };
        webSocketConnection.on('message', (msgBuffer) => {
          // NOTE(jwetzell): extract some key request properties
          const wsMsg = new WebSocketMessage(msgBuffer, {
            protocol: 'tcp',
            address: req.socket?.remoteAddress,
            port: req.socket?.remotePort,
          });
          this.emit('messageIn', wsMsg);
        });
      }
    });

    this.httpServer.on('upgrade', (req, socket, head) => {
      this.wsServer.handleUpgrade(req, socket, head, (ws) => {
        this.wsServer.emit('connection', ws, req);
      });
    });
  }

  servePath(filePath) {
    this.app.use('/', express.static(filePath));
    // NOTE(jwetzell): move the static paths up in priority
    this.app._router.stack.sort((a, b) => {
      if (a.name === 'serveStatic') {
        return -1;
      }
      if (b.name === 'serveStatic') {
        return 1;
      }
      return 0;
    });
  }

  reload(params) {
    if (this.server !== undefined) {
      this.server.close();
      this.server.listen(params.port, params.address ? params.address : '0.0.0.0', () => {
        logger.debug(
          `http: web interface listening on port ${(this.httpServer.address() as AddressInfo).address}:${(this.httpServer.address() as AddressInfo).port}`
        );
        this.emit('started');
      });
      return;
    }

    if (this.webUISockets.length > 0) {
      this.webUISockets.forEach((webUISocket) => {
        webUISocket.close();
      });
    }

    try {
      this.server = this.httpServer.listen(params.port, params.address ? params.address : '0.0.0.0', () => {
        logger.debug(
          `http: web interface listening on port ${(this.httpServer.address() as AddressInfo).address}:${(this.httpServer.address() as AddressInfo).port}`
        );
        this.emit('started');
      });

      this.server.on('close', () => {
        this.emit('stopped');
      });
    } catch (error) {
      logger.error(`http: problem launching server - ${error}`);
    }
  }

  sendToWebUISockets(eventName: string, data) {
    this.webUISockets.forEach((socket) => {
      socket.send(
        JSON.stringify({
          eventName,
          data,
        })
      );
    });
  }

  send(url: string, method: string, body, contentType: string) {
    const request = superagent(method, url);
    if (contentType !== undefined) {
      request.type(contentType);
    }

    if (body !== '') {
      request.send(body);
    }

    request.end((error) => {
      if (error) {
        logger.error(`http: problem sending http - ${error}`);
      }
    });
  }

  stop() {
    // NOTE(jwetzell): close all web sockets
    this.webUISockets.forEach((socket) => {
      socket.close();
    });

    this.openWebSockets.forEach((socket) => {
      socket.close();
    });

    // NOTE(jwetzell): close http server
    if (this.server) {
      if (this.server.listening) {
        this.server.close();
      }
      this.emit('stopped');
    } else {
      this.emit('stopped');
    }
  }

  get status() {
    return {
      enabled: !disabled.protocols.has('http'),
      listening: this.server ? this.server.listening : false,
      address: this.server ? this.server.address() : {},
    };
  }
}

export default HTTPProtocol;
