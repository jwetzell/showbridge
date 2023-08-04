const { EventEmitter } = require('events');
const { logger } = require('./utils');
const Config = require('./config');
const {
  UDPServer,
  TCPServer,
  MIDIServer,
  WebSocketServer,
  HTTPServer,
  MQTTClient,
  CloudServer,
} = require('./protocols');

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

    this.protocols.http.on('config_uploaded', (updatedConfig) => {
      try {
        this.config = updatedConfig;
        this.reload();
        this.emit('config_updated', updatedConfig);
        logger.debug('app: config updated successfully');
      } catch (error) {
        logger.error(error);
        logger.error('app: problem applying new config');
      }
    });
  }

  stop() {
    // TODO(jwetzell): actually wait for all servers to stop
    Object.keys(this.protocols).forEach((protocol) => {
      this.protocols[protocol].stop();
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
    this.protocols.http.setConfig(this.config);
  }

  setLogLevel(logLevel) {
    logger.level = logLevel;
  }

  servePath(filePath) {
    this.protocols.http.servePath(filePath);
  }

  processMessage(msg) {
    this.emit('message', msg.toJSON());
    this.protocols.ws.sendToWebUISockets('message', {
      message: msg.toJSON(),
    });
    const triggers = this.config[msg.messageType]?.triggers;
    if (triggers !== undefined && triggers.length > 0) {
      triggers.forEach((trigger, triggerIndex) => {
        try {
          const triggerPath = `${msg.messageType}/triggers/${triggerIndex}`;
          if (!trigger.enabled) {
            logger.debug(`trigger: ${triggerPath}: not enabled`);
            this.emit('trigger', trigger.toJSON(), `${triggerPath}`, false);
            this.protocols.ws.sendToWebUISockets('trigger', {
              trigger: trigger.toJSON(),
              path: `${triggerPath}`,
              fired: false,
            });
            return;
          }

          if (trigger.shouldFire(msg)) {
            this.emit('trigger', trigger.toJSON(), triggerPath, true);
            this.protocols.ws.sendToWebUISockets('trigger', {
              trigger: trigger.toJSON(),
              path: `${triggerPath}`,
              fired: true,
            });
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
