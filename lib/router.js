import { EventEmitter } from 'events';
import Config from './config.js';
import { logger } from './utils/index.js';

import {
  CloudServer,
  HTTPServer,
  MIDIServer,
  MQTTClient,
  TCPServer,
  UDPServer,
  WebSocketServer,
} from './protocols/index.js';

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
        logger.debug('router: config updated successfully');
      } catch (error) {
        logger.error(error);
        logger.error('router: problem applying new config');
      }
    });

    this.protocols.ws.on('protocol_status', () => {
      const protocolStatus = {};
      Object.keys(this.protocols).forEach((protocol) => {
        protocolStatus[protocol] = this.protocols[protocol].status;
      });
      this.protocols.ws.sendToWebUISockets('protocol_status', protocolStatus);
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
    let protocolsClosed = 0;
    logger.info('router: waiting for all protocols to say they have stopped');
    const protocolKeys = Object.keys(this.protocols);
    protocolKeys.forEach((protocol) => {
      this.protocols[protocol].on('stopped', () => {
        protocolsClosed += 1;
        logger.trace(`router: protocol ${protocol} has stopped`);
        if (protocolsClosed === protocolKeys.length) {
          logger.info('router: all protocols have stopped');
          this.emit('stopped');
        }
      });
      this.protocols[protocol].stop();
    });

    // NOTE(jwetzell): if protocols haven't stopped in 5 seconds just stop
    setTimeout(() => {
      logger.warn('router: protocols have taken a while to stop');
      this.emit('stopped');
    }, 5000);
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
        logger.error(`router: problem reloading ${protocol} protocol`);
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
    const msgJSON = msg.toJSON();
    this.emit('message', msgJSON);
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
                  const subActionEventObject = {
                    action: subAction,
                    path: `${actionEventObj.path}/actions/${subActionPath}`,
                    fired: enabled,
                  };
                  this.emit('action', subActionEventObject);
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

export default Router;
