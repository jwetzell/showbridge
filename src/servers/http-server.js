const events = require('events');
const cors = require('cors');
const express = require('express');
const path = require('path');
const HTTPMessage = require('../models/message/http-message');

class HTTPServer {
  constructor(server, app) {
    this.eventEmitter = new events.EventEmitter();

    this.httpServer = server;

    // Express Server
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

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
  }

  reload(port) {
    if (this.server) {
      this.server.close();
    }
    this.server = this.httpServer.listen(port, () => {
      console.info(`web interface listening on port ${port}`);
    });
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = HTTPServer;
