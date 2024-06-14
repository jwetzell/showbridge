import { EventEmitter } from 'node:events';

import cors from 'cors';
import express, { Application } from 'express';
import http, { IncomingMessage, Server, ServerResponse } from 'http';
import { get, has, set } from 'lodash-es';
import { AddressInfo } from 'net';
import superagent from 'superagent';
import Config from '../config.js';
import { HTTPMessage } from '../messages/index.js';
import Router from '../router.js';
import { disabled, logger } from '../utils/index.js';

class HTTPProtocol extends EventEmitter {
  router: Router;
  app: Application;
  httpServer: Server<typeof IncomingMessage, typeof ServerResponse>;
  server: Server<typeof IncomingMessage, typeof ServerResponse>;

  constructor(router) {
    super();

    this.router = router;

    this.app = express();
    this.httpServer = http.createServer(this.app);

    this.httpServer.on('upgrade', (req, socket, head) => {
      this.emit('httpUpgrade', req, socket, head);
    });

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
