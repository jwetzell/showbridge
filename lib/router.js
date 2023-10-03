import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import Config from './config.js';
import { logger } from './utils/index.js';

import {
  CloudProtocol,
  HTTPProtocol,
  MIDIProtocol,
  MQTTProtocol,
  TCPProtocol,
  UDPProtocol,
  WebSocketProtocol,
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
      http: new HTTPProtocol(),
      udp: new UDPProtocol(),
      tcp: new TCPProtocol(),
      midi: new MIDIProtocol(),
      mqtt: new MQTTProtocol(),
      cloud: new CloudProtocol(),
      ws: new WebSocketProtocol(),
    };

    this.protocols.http.setConfig(this.config);

    // NOTE(jwetzell): listen for all messages on all protocols
    Object.keys(this.protocols).forEach((protocol) => {
      this.protocols[protocol].on('messageIn', (msg) => {
        this.processMessage(msg);
      });
      this.protocols[protocol].on('messageOut', (args) => this.emit('messageOut', protocol, args));
    });

    // NOTE(jwetzell): websocket server needs the http server instance to load
    this.protocols.http.on('httpUpgrade', (req, socket, head) => {
      this.protocols.ws.handleUpgrade(req, socket, head);
    });

    this.protocols.http.on('configUploaded', (updatedConfig) => {
      try {
        this.config = updatedConfig;
        this.reload();
        this.emit('configUpdated', updatedConfig);
        logger.debug('router: config updated successfully');
      } catch (error) {
        logger.error(error);
        logger.error('router: problem applying new config');
      }
    });

    this.protocols.ws.on('getProtocolStatus', (webSocket) => {
      const protocolStatusEvent = {
        eventType: 'protocolStatus',
        data: {},
      };
      try {
        Object.keys(this.protocols).forEach((protocol) => {
          protocolStatusEvent.data[protocol] = this.protocols[protocol].status;
        });
        if (webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(JSON.stringify(protocolStatusEvent));
        } else {
          logger.error(`router: can't send protocolStatus to closed websockets`);
        }
      } catch (error) {
        logger.error(`router: problem sending protocolStatus to websocket`);
        logger.error(error);
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

    this.on('messageIn', (messageInEvent) => {
      this.protocols.ws.sendToWebUISockets('messageIn', messageInEvent);
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

    // NOTE(jwetzell): if protocols haven't stopped in a resaonable time just stop
    setTimeout(() => {
      logger.warn('router: protocols have taken a while to stop');
      this.emit('stopped');
    }, 2000);
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
    const messageEventObj = {
      timestamp: Date.now(),
      message: msgJSON,
    };
    this.emit('messageIn', messageEventObj);
    const triggers = this.config[msg.messageType]?.triggers;
    if (triggers !== undefined && triggers.length > 0) {
      triggers.forEach((trigger, triggerIndex) => {
        try {
          const triggerShouldFire = trigger.shouldFire(msg);

          const triggerEventObj = {
            timestamp: Date.now(),
            trigger: trigger.toJSON(),
            path: `${msg.messageType}/triggers/${triggerIndex}`,
            fired: triggerShouldFire,
          };

          logger.trace(`trigger: ${triggerEventObj.path}: ${triggerShouldFire ? 'fired' : 'skipped'}`);
          if (triggerShouldFire) {
            trigger.actions?.forEach((action, actionIndex) => {
              const actionEventObj = {
                timestamp: Date.now(),
                action: action.toJSON(),
                path: `${triggerEventObj.path}/actions/${actionIndex}`,
                fired: action.enabled,
              };
              logger.trace(`action: ${actionEventObj.path}: ${actionEventObj.fired ? 'fired' : 'skipped'}`);

              try {
                // NOTE(jwetzell): listen for subaction events and bubble them up
                action.on('transform', (transform, transformPath, enabled) => {
                  const transformEventObj = {
                    timestamp: Date.now(),
                    transform,
                    path: `${actionEventObj.path}/${transformPath}`,
                    fired: enabled,
                  };
                  logger.trace(
                    `transform: ${transformEventObj.path}: ${transformEventObj.fired ? 'fired' : 'skipped'}`
                  );

                  this.emit('transform', transformEventObj);
                });

                // NOTE(jwetzell): listen for subaction events and bubble them up
                action.on('action', (subAction, subActionPath, enabled) => {
                  const subActionEventObject = {
                    timestamp: Date.now(),
                    action: subAction,
                    path: `${actionEventObj.path}/actions/${subActionPath}`,
                    fired: enabled,
                  };
                  this.emit('action', subActionEventObject);
                });

                // NOTE(jwetzell): clean up listeners
                action.once('finished', () => {
                  action.removeAllListeners('action');
                  action.removeAllListeners('transform');
                });

                // NOTE(jwetzell): perform the action
                action.do(msg, this.vars, this.protocols);
                this.emit('action', actionEventObj);
              } catch (error) {
                logger.error(`action: problem running action - ${error}`);
              }
            });
          }
          this.emit('trigger', triggerEventObj);
        } catch (error) {
          logger.error(`trigger: problem evaluating trigger - ${error}`);
        }
      });
    }
  }
}

export default Router;
