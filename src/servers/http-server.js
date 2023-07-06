const events = require('events');
const cors = require('cors');
const express = require('express');
const path = require('path');
const HTTPMessage = require('../models/message/http-message');
const Config = require('../models/config');
const { logger } = require('../utils/helper');

class HTTPServer {
  constructor(server, app) {
    this.eventEmitter = new events.EventEmitter();

    this.httpServer = server;
    this.config = {};

    // Express Server
    app.use(cors());
    app.use(express.json());

    app.get('/config', (req, res) => {
      res.send(this.config);
    });

    app.get('/config/schema', (req, res) => {
      res.send(this.config.getSchema());
    });

    app.post('/config', (req, res, next) => {
      try {
        const configToUpdate = new Config(req.body);
        //TODO(jwetzell): handle errors on the reload and send them back
        this.eventEmitter.emit('reload', configToUpdate);
        this.setConfig(configToUpdate);
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

    //TODO(jwetzell): error handling on these endpoints
    app.get('/*', (req, res) => {
      const parsedHTTP = new HTTPMessage(req);
      this.eventEmitter.emit('message', parsedHTTP, 'http');
      res.status(200).send({ msg: 'ok' });
    });

    app.post('/*', (req, res) => {
      const parsedHTTP = new HTTPMessage(req);
      this.eventEmitter.emit('message', parsedHTTP, 'http');
      res.status(200).send({ msg: 'ok' });
    });

    this.httpServer.on('clientError', (err, socket) => {
      throw err;
    });
  }

  reload(params) {
    if (this.server) {
      this.server.close();
    }
    try {
      this.server = this.httpServer.listen(params.port, () => {
        logger.info(`HTTP: web interface listening on port ${params.port}`);
      });
    } catch (err) {
      logger.error(err);
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }

  setConfig(config) {
    this.config = config;
  }
}

module.exports = HTTPServer;
