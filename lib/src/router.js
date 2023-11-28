import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import Config from './config.js';
import { disabled, logger } from './utils/index.js';

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

    this.protocols.http.setRouter(this);

    // NOTE(jwetzell): listen for all messages on all protocols
    Object.keys(this.protocols).forEach((protocol) => {
      this.protocols[protocol].on('messageIn', (msg) => {
        this.processMessage(msg);
      });
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
        eventName: 'protocolStatus',
        data: {},
      };
      try {
        Object.keys(this.protocols).forEach((protocol) => {
          protocolStatusEvent.data[protocol] = this.protocols[protocol].status;
        });

        // NOTE(jwetzell): osc is a "shadow" protocol so need to insert the status manually
        protocolStatusEvent.data.osc = {
          enabled: protocolStatusEvent.data.tcp.enabled || protocolStatusEvent.data.udp.enabled,
          udp: protocolStatusEvent.data.udp,
          tcp: protocolStatusEvent.data.tcp,
        };

        if (webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(JSON.stringify(protocolStatusEvent));
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
      if (actionEvent.action?.type === 'store') {
        this.emit('varsUpdated', this.vars);
      }

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
      this.stopProtocol(protocol);
    });

    // NOTE(jwetzell): if protocols haven't stopped in a reasonable time just stop
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
        this.startProtocol(protocol);
      } catch (error) {
        logger.error(`router: problem reloading ${protocol} protocol`);
        logger.error(error);
      }
    });
    this.protocols.http.setRouter(this);
  }

  setLogLevel(logLevel) {
    logger.level = logLevel;
  }

  servePath(filePath) {
    this.protocols.http.servePath(filePath);
  }

  processTrigger(trigger, triggerPath, msg) {
    try {
      const triggerShouldFire = trigger.shouldFire(msg);

      const triggerEventObj = {
        timestamp: Date.now(),
        trigger: trigger.toJSON(),
        path: triggerPath,
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
              logger.trace(`transform: ${transformEventObj.path}: ${transformEventObj.fired ? 'fired' : 'skipped'}`);

              this.emit('transform', transformEventObj);
            });

            // NOTE(jwetzell): listen for subaction events and bubble them up
            action.on('action', (subAction, subActionPath, enabled) => {
              const subActionEventObject = {
                timestamp: Date.now(),
                action: subAction,
                path: `${actionEventObj.path}/${subActionPath}`,
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

        if (trigger.subTriggers) {
          trigger.subTriggers.forEach((subTrigger, subTriggerIndex) => {
            this.processTrigger(subTrigger, `${triggerPath}/subTriggers/${subTriggerIndex}`, msg);
          });
        }
      }
      this.emit('trigger', triggerEventObj);
    } catch (error) {
      logger.error(`trigger: problem evaluating trigger - ${error}`);
    }
  }

  processMessage(msg) {
    const messageEventObj = {
      type: msg.messageType,
    };
    this.emit('messageIn', messageEventObj);
    const triggers = this.config.getTriggers(msg.messageType);
    if (triggers !== undefined && triggers.length > 0) {
      triggers.forEach((trigger, triggerIndex) => {
        this.processTrigger(trigger, `${msg.messageType}/triggers/${triggerIndex}`, msg);
      });
    }
  }

  stopProtocol(type) {
    if (this.protocols[type]) {
      this.protocols[type].stop();
    }
  }

  startProtocol(type) {
    if (this.config[type] && !disabled.protocols.has(type)) {
      if (this.config[type].params) {
        this.protocols[type].reload(this.config[type].params);
      } else {
        this.protocols[type].reload();
      }
    }
  }

  disableAction(type) {
    disabled.actions.add(type);
  }

  enableAction(type) {
    disabled.actions.delete(type);
  }

  disableProtocol(type) {
    disabled.protocols.add(type);
    this.stopProtocol(type);
  }

  enabledProtocol(type) {
    disabled.protocols.delete(type);
    this.startProtocol(type);
  }

  disableTrigger(type) {
    disabled.triggers.add(type);
  }

  enableTrigger(type) {
    disabled.triggers.delete(type);
  }

  disableTransform(type) {
    disabled.transforms.add(type);
  }

  enableTransform(type) {
    disabled.transforms.delete(type);
  }
}

export default Router;
