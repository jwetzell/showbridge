const { EventEmitter } = require('events');
const cors = require('cors');
const express = require('express');
const http = require('http');
const superagent = require('superagent');
const HTTPMessage = require('../messages/http-message');
const Config = require('../config');
const { logger } = require('../utils/helper');

class HTTPServer extends EventEmitter {
  constructor() {
    super();

    const app = express();
    this.httpServer = http.createServer(app);

    // Express Server
    app.use(cors());
    app.use(express.json());

    app.get('/config', (req, res) => {
      res.send(this.config.config);
    });

    app.get('/config/schema', (req, res) => {
      res.send(this.config.getSchema());
    });

    app.post('/config', (req, res) => {
      try {
        const configToUpdate = new Config(req.body);
        // TODO(jwetzell): handle errors on the reload and send them back
        this.emit('reload', configToUpdate);
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
    app.get('/*', (req, res) => {
      const parsedHTTP = new HTTPMessage(req);
      this.emit('message', parsedHTTP);
      res.status(200).send({ msg: 'ok' });
    });

    app.post('/*', (req, res) => {
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

  reload(params) {
    if (this.server !== undefined) {
      this.server.close();
    }
    try {
      this.server = this.httpServer.listen(params.port, () => {
        logger.debug(`http: web interface listening on port ${params.port}`);
      });
      this.emit('http-server', this.httpServer);
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
}

module.exports = HTTPServer;
