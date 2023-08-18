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
      ws: new WebSocketServer(),
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
    this.protocols.http.on('http-upgrade', (req, socket, head) => {
      this.protocols.ws.handleUpgrade(req, socket, head);
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

    this.on('trigger', (triggerEvent) => {
      this.protocols.ws.sendToWebUISockets('trigger', triggerEvent);
    });

    this.on('action', (actionEvent) => {
      this.protocols.ws.sendToWebUISockets('action', actionEvent);
    });

    this.on('transform', (transformEvent) => {
      this.protocols.ws.sendToWebUISockets('transform', transformEvent);
    });

    this.on('message', (message) => {
      this.protocols.ws.sendToWebUISockets('message', message);
    });
  }

  stop() {
    // TODO(jwetzell): actually wait for all servers to stop?
    Object.keys(this.protocols).forEach((protocol) => {
      this.protocols[protocol].stop();
    });
    this.emit('stopped');
  }

  start() {
    this.reload();
  }

  reload() {
    Object.keys(this.protocols).forEach((protocol) => {
      try {
        if (this.config[protocol]) {
          if (this.config[protocol].params) {
            this.protocols[protocol].reload(this.config[protocol].params);
          } else {
            this.protocols[protocol].reload();
          }
        }
      } catch (error) {
        logger.error(`app: problem reloading ${protocol} protocol`);
        logger.error(error);
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
    const triggers = this.config[msg.messageType]?.triggers;
    if (triggers !== undefined && triggers.length > 0) {
      triggers.forEach((trigger, triggerIndex) => {
        try {
          const triggerShouldFire = trigger.shouldFire(msg);

          const triggerEventObj = {
            trigger: trigger.toJSON(),
            path: `${msg.messageType}/triggers/${triggerIndex}`,
            fired: triggerShouldFire,
          };

          logger.trace(`trigger: ${triggerEventObj.path}: ${triggerShouldFire ? 'fired' : 'skipped'}`);
          if (triggerShouldFire) {
            trigger.actions.forEach((action, actionIndex) => {
              const actionEventObj = {
                action: action.toJSON(),
                path: `${triggerEventObj.path}/actions/${actionIndex}`,
                fired: action.enabled,
              };
              logger.trace(`action: ${actionEventObj.path}: ${actionEventObj.fired ? 'fired' : 'skipped'}`);

              try {
                action.on('transform', (transform, transformPath, enabled) => {
                  const transformEventObj = {
                    transform,
                    path: `${actionEventObj.path}/${transformPath}`,
                    fired: enabled,
                  };
                  logger.trace(
                    `transform: ${transformEventObj.path}: ${transformEventObj.fired ? 'fired' : 'skipped'}`
                  );

                  if (transformEventObj.fired) {
                    this.emit('transform', transformEventObj);
                  }
                });
                action.on('action', (subAction, subActionPath, enabled) => {
                  this.emit('action', {
                    action: subAction,
                    path: `${actionEventObj.path}/actions/${subActionPath}`,
                    fired: enabled,
                  });
                });
                action.once('finished', () => {
                  action.removeAllListeners('action');
                  action.removeAllListeners('transform');
                });
                action.do(msg, this.vars, this.protocols);
                this.emit('action', actionEventObj);
              } catch (error) {
                logger.error(`action: problem running action - ${error}`);
              }
            });
            this.emit('trigger', triggerEventObj);
          }
        } catch (error) {
          logger.error(`trigger: problem evaluating trigger - ${error}`);
        }
      });
    }
  }
}

module.exports = Router;
