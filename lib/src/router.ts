import { isEqual } from 'lodash-es';
import { EventEmitter } from 'node:events';
import { WebSocket } from 'ws';
import Config from './config.js';
import { disabled, logger } from './utils/index.js';

import { RouterVars } from '@showbridge/types';
import Action from './actions/action.js';
import { ActionTypeClassMap } from './actions/index.js';
import { Message } from './messages/index.js';
import {
  CloudProtocol,
  HTTPProtocol,
  MIDIProtocol,
  MQTTProtocol,
  TCPProtocol,
  UDPProtocol,
  WebSocketProtocol,
} from './protocols/index.js';
import Trigger from './triggers/trigger.js';

export type RouterProtocols = {
  http: HTTPProtocol;
  udp: UDPProtocol;
  tcp: TCPProtocol;
  midi: MIDIProtocol;
  mqtt: MQTTProtocol;
  cloud: CloudProtocol;
  ws: WebSocketProtocol;
};

class Router extends EventEmitter {
  vars: RouterVars;
  _config: Config;
  protocols: RouterProtocols;

  constructor(config: Config) {
    super();
    if (!(config instanceof Config)) {
      throw new Error('router config is not an instance of Config');
    }
    this.vars = {};
    this._config = config;
    this.protocols = {
      http: new HTTPProtocol(this),
      udp: new UDPProtocol(this),
      tcp: new TCPProtocol(this),
      midi: new MIDIProtocol(this),
      mqtt: new MQTTProtocol(this),
      cloud: new CloudProtocol(this),
      ws: new WebSocketProtocol(this),
    };

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
        this.emit('configUpdated', updatedConfig);
        logger.debug('router: config updated successfully');
      } catch (error) {
        logger.error(error);
        logger.error('router: problem applying new config');
      }
    });

    this.protocols.ws.on('runAction', (action: Action<unknown>, msg: Message, vars: RouterVars) => {
      this.runAction(action, msg, vars);
    });

    this.protocols.ws.on('getProtocolStatus', (webSocket) => {
      const protocolStatusEvent: any = {
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
  }

  set config(value: Config) {
    const protocolsToReload = [];

    Object.keys(this.protocols).forEach((protocol) => {
      if (value[protocol].params) {
        if (!isEqual(value[protocol].params, this.config[protocol].params)) {
          logger.debug(`router: ${protocol} config has changed and marked for reload`);
          protocolsToReload.push(protocol);
        }
      }
    });

    this._config = value;

    protocolsToReload.forEach((protocol) => {
      this.reloadProtocol(protocol);
    });
  }

  get config() {
    return this._config;
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
    Object.keys(this.protocols).forEach((protocol) => {
      this.protocols[protocol].on('started', () => {
        this.emit('protocolStarted', protocol);
      });
      try {
        this.reloadProtocol(protocol);
      } catch (error) {
        logger.error(`router: problem reloading ${protocol} protocol`);
        logger.error(error);
      }
    });
  }

  setLogLevel(logLevel) {
    logger.level = logLevel;
  }

  servePath(filePath: string) {
    this.protocols.http.servePath(filePath);
  }

  processTrigger(trigger: Trigger<unknown>, triggerPath: string, msg: Message) {
    try {
      const triggerShouldFire = trigger.shouldFire(msg, this.vars);

      const triggerEventObj = {
        path: triggerPath,
        fired: triggerShouldFire,
      };

      logger.trace(`trigger: ${triggerEventObj.path}: ${triggerShouldFire ? 'fired' : 'skipped'}`);
      if (triggerShouldFire) {
        trigger.actions?.forEach((action, actionIndex) => {
          const actionEventObj = {
            action: action,
            path: `${triggerEventObj.path}/actions/${actionIndex}`,
            fired: action.enabled,
          };
          logger.trace(`action: ${actionEventObj.path}: ${actionEventObj.fired ? 'fired' : 'skipped'}`);

          try {
            // NOTE(jwetzell): listen for subaction events and bubble them up
            action.on('transform', (transformPath, enabled) => {
              const transformEventObj = {
                path: `${actionEventObj.path}/${transformPath}`,
                fired: enabled,
              };
              logger.trace(`transform: ${transformEventObj.path}: ${transformEventObj.fired ? 'fired' : 'skipped'}`);

              this.emit('transform', transformEventObj);
            });

            // NOTE(jwetzell): listen for subaction events and bubble them up
            action.on('action', (subAction, subActionPath, enabled) => {
              const subActionEventObject = {
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
            action.run(msg, this.vars, this.protocols);
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

  processMessage(msg: Message) {
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

  runAction(action: Action<unknown>, msg: Message, vars: RouterVars) {
    try {
      const onDemandAction = new ActionTypeClassMap[action.type](action);
      onDemandAction.run(msg, vars || this.vars, this.protocols);
    } catch (error) {
      logger.error('router: problem running action on demand');
      logger.error(error);
    }
  }

  stopProtocol(type: string) {
    if (this.protocols[type]) {
      this.protocols[type].stop();
    }
  }

  reloadProtocol(type: string) {
    logger.trace(`router: reloading ${type} protocol`);
    if (this.config[type] && !disabled.protocols.has(type)) {
      if (this.config[type].params) {
        this.protocols[type].reload(this.config[type].params);
      } else {
        this.protocols[type].reload();
      }
    }
  }

  disableAction(type: string) {
    disabled.actions.add(type);
  }

  enableAction(type: string) {
    disabled.actions.delete(type);
  }

  disableProtocol(type: string) {
    disabled.protocols.add(type);
    this.stopProtocol(type);
  }

  enabledProtocol(type: string) {
    disabled.protocols.delete(type);
    this.reloadProtocol(type);
  }

  disableTrigger(type: string) {
    disabled.triggers.add(type);
  }

  enableTrigger(type: string) {
    disabled.triggers.delete(type);
  }

  disableTransform(type: string) {
    disabled.transforms.add(type);
  }

  enableTransform(type: string) {
    disabled.transforms.delete(type);
  }
}

export default Router;
