/* eslint-disable no-underscore-dangle */
const { EventEmitter } = require('events');
const cors = require('cors');
const express = require('express');
const http = require('http');
const superagent = require('superagent');
const HTTPMessage = require('../messages/http-message');
const Config = require('../config');
const { logger } = require('../utils');

class HTTPServer extends EventEmitter {
  constructor() {
    super();

    this.app = express();
    this.httpServer = http.createServer(this.app);

    this.httpServer.on('upgrade', (req, socket, head) => {
      this.emit('http-upgrade', req, socket, head);
    });

    // Express Server
    this.app.use(cors());
    this.app.use(express.json());

    this.app.get('/config', (req, res) => {
      res.send(this.config);
    });

    this.app.get('/config/schema', (req, res) => {
      res.send(this.config.getSchema());
    });

    this.app.post('/config', (req, res) => {
      try {
        const configToUpdate = new Config(req.body);
        // TODO(jwetzell): handle errors on the reload and send them back
        this.emit('config_uploaded', configToUpdate);
        this.config = configToUpdate;
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

    // TODO(jwetzell): error handling on these endpoints
    this.app.get('/*', (req, res) => {
      const parsedHTTP = new HTTPMessage(req);
      this.emit('message', parsedHTTP);
      res.status(200).send({ msg: 'ok' });
    });

    this.app.post('/*', (req, res) => {
      const parsedHTTP = new HTTPMessage(req);
      this.emit('message', parsedHTTP);
      res.status(200).send({ msg: 'ok' });
    });

    this.httpServer.on('clientError', (error) => {
      logger.error(error);
    });
  }

  setConfig(config) {
    this.config = config;
  }

  servePath(filePath) {
    this.app.use('/', express.static(filePath));
    // move the static paths up in priority
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
    }
    try {
      this.server = this.httpServer.listen(params.port, params.address ? params.address : '0.0.0.0', () => {
        logger.debug(
          `http: web interface listening on port ${this.httpServer.address().address}:${this.httpServer.address().port}`
        );
      });
    } catch (error) {
      logger.error(`http: problem launching server - ${error}`);
    }
  }

  send(url, method, body, contentType) {
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
        return;
      }
      this.emit('send', { url, method, body, contentType });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = HTTPServer;
