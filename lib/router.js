const { EventEmitter } = require('events');
const UDPServer = require('./protocols/udp-server');
const TCPServer = require('./protocols/tcp-server');
const MIDIServer = require('./protocols/midi-server');
const WebSocketServer = require('./protocols/websocket-server');
const HTTPServer = require('./protocols/http-server');
const MQTTClient = require('./protocols/mqtt-client');
const { logger } = require('./utils/helper');
const CloudServer = require('./protocols/cloud-server');
const Config = require('./config');

class Router extends EventEmitter {
  constructor(config) {
    super();
    if (!(config instanceof Config)) {
      throw new Error('router config is not an instance of Config');
    }
    this.vars = {};
    this.config = config;
    this.protocols = {
      http: new HTTPServer(),
      udp: new UDPServer(),
      tcp: new TCPServer(),
      midi: new MIDIServer(),
      mqtt: new MQTTClient(),
      cloud: new CloudServer(),
    };

    this.protocols.http.setConfig(this.config);

    // NOTE(jwetzell): listen for all messages on all protocols
    Object.keys(this.protocols).forEach((protocol) => {
      this.protocols[protocol].on('message', (msg) => {
        this.processMessage(msg);
      });
      this.protocols[protocol].on('send', (args) => this.emit('message_out', protocol, args));
    });

    // NOTE(jwetzell): websocket server needs the http server instance to load
    this.protocols.http.on('http-server', (server) => {
      this.protocols.ws = new WebSocketServer(server);
      this.protocols.ws.on('message', (msg) => {
        this.processMessage(msg);
      });
    });

    this.protocols.http.on('reload', (updatedConfig) => {
      try {
        this.config = updatedConfig;
        this.reload();
        logger.debug('app: config updated successfully');
      } catch (error) {
        logger.error('app: problem applying new config');
      }
    });
  }

  start() {
    this.reload();
  }

  reload() {
    Object.keys(this.protocols).forEach((protocol) => {
      if (this.config[protocol]) {
        if (this.config[protocol].params) {
          this.protocols[protocol].reload(this.config[protocol].params);
        } else {
          this.protocols[protocol].reload();
        }
      }
    });
  }

  setLogLevel(logLevel) {
    logger.level = logLevel;
  }

  processMessage(msg) {
    this.emit('message', msg.toJSON());
    const triggers = this.config[msg.messageType]?.triggers;
    if (triggers !== undefined && triggers.length > 0) {
      triggers.forEach((trigger, triggerIndex) => {
        try {
          const triggerPath = `${msg.messageType}/triggers/${triggerIndex}`;
          if (!trigger.enabled) {
            logger.debug(`trigger: ${triggerPath}: not enabled`);
            this.emit('trigger', trigger.toJSON(), `${triggerPath}`, false);
            return;
          }

          if (trigger.shouldFire(msg)) {
            this.emit('trigger', trigger.toJSON(), triggerPath, true);
            logger.trace(`trigger: ${triggerPath}: fired`);
            trigger.actions.forEach((action, actionIndex) => {
              if (!action.enabled) {
                logger.debug(`action: ${triggerPath}/actions/${actionIndex}: not enabled`);
                this.emit('action', action.toJSON(), `${triggerPath}/actions/${actionIndex}`, false);
                return;
              }

              try {
                action.do(msg, this.vars, this.protocols);
                this.emit('action', action.toJSON(), `${triggerPath}/actions/${actionIndex}`, true);
              } catch (error) {
                logger.error(`action: problem running action - ${error}`);
              }
            });
          } else {
            logger.trace(`trigger: ${triggerPath}: not fired`);
          }
        } catch (error) {
          logger.error(`trigger: problem evaluating trigger - ${error}`);
        }
      });
    }
  }
}

module.exports = Router;
