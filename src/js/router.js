const express = require('express');

const app = express();
const server = require('http').createServer(app);
const superagent = require('superagent');
const osc = require('osc-min');
const { exec } = require('child_process');
const UDPServer = require('./servers/udp-server');
const TCPServer = require('./servers/tcp-server');
const MIDIServer = require('./servers/midi-server');
const WebSocketServer = require('./servers/websocket-server');
const HTTPServer = require('./servers/http-server');
const MQTTClient = require('./servers/mqtt-client');

const { logger } = require('./utils/helper');
const { resolveTemplatedProperty, hexToBytes } = require('./utils/helper');
const MIDIMessage = require('./message/midi-message');

class Router {
  constructor(config) {
    this.vars = {};
    this.config = config;
    this.servers = {
      http: new HTTPServer(server, app),
      udp: new UDPServer(),
      tcp: new TCPServer(),
      ws: new WebSocketServer(server),
      midi: new MIDIServer(),
      mqtt: new MQTTClient(),
    };

    this.servers.http.config = this.config;

    // NOTE(jwetzell): listen for all messages on servers
    Object.keys(this.servers).forEach((serverType) => {
      this.servers[serverType].on('message', (msg) => {
        this.processMessage(msg);
      });
    });

    this.servers.http.on('reload', (updatedConfig) => {
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
    Object.keys(this.servers).forEach((serverType) => {
      if (this.config[serverType].params) {
        this.servers[serverType].reload(this.config[serverType].params);
      } else {
        this.servers[serverType].reload();
      }
    });
  }

  processMessage(msg) {
    const triggers = this.config[msg.messageType]?.triggers;
    if (triggers !== undefined && triggers.length > 0) {
      for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex += 1) {
        const trigger = triggers[triggerIndex];
        try {
          if (trigger.shouldFire(msg)) {
            logger.trace(`${msg.messageType}-trigger-${triggerIndex}: fired`);
            trigger.actions.forEach((action) => this.doAction(action, msg, trigger));
          } else {
            logger.trace(`${msg.messageType}-trigger-${triggerIndex}: not fired`);
          }
        } catch (error) {
          logger.error(`trigger: problem evaluating trigger - ${error}`);
        }
      }
    }
  }

  doAction(action, _msg, trigger) {
    if (!action.enabled) {
      logger.debug(`action: ${action.type} is disabled skipping...`);
      return;
    }
    logger.debug(`action: ${action.type} triggered from ${trigger.type}`);

    try {
      const msg = action.getTransformedMessage(_msg, this.vars);

      switch (action.type) {
        case 'forward':
          try {
            const msgToForward = msg.bytes;

            if (msgToForward !== undefined) {
              if (action.params.protocol === 'udp') {
                this.servers.udp.send(msgToForward, action.params.port, action.params.host);
              } else if (action.params.protocol === 'tcp') {
                this.servers.tcp.send(msgToForward, action.params.port, action.params.host, msg.messageType === 'osc');
              } else {
                logger.error(`action: unhandled forward protocol = ${action.params.protocol}`);
              }
            } else {
              logger.error('action: this is not a forwardable message type');
            }
          } catch (error) {
            logger.error(`action: error outputting osc - ${error}`);
          }
          break;
        case 'osc-output':
          try {
            const address = resolveTemplatedProperty(action.params, 'address', { msg, vars: this.vars });

            if (address === undefined) {
              logger.error('action: either address or _address property need to be set for osc-output action');
              return;
            }

            let args = resolveTemplatedProperty(action.params, 'args', { msg, vars: this.vars });
            if (args === undefined) {
              args = [];
            }

            const outBuff = osc.toBuffer({
              address,
              args,
            });

            if (action.params.protocol === 'udp') {
              this.servers.udp.send(outBuff, action.params.port, action.params.host);
            } else if (action.params.protocol === 'tcp') {
              this.servers.tcp.send(outBuff, action.params.port, action.params.host, true);
            } else {
              logger.error(`action: unhandled osc output protocol = ${action.params.protocol}`);
            }
          } catch (error) {
            logger.error(`action: error outputting osc - ${error}`);
          }
          break;
        case 'udp-output': {
          let udpSend;

          if (action.params.bytes !== undefined) {
            udpSend = action.params.bytes;
          } else if (action.params.hex !== undefined) {
            udpSend = hexToBytes(action.params.hex);
          } else {
            // check for string or _string
            udpSend = resolveTemplatedProperty(action.params, 'string', { msg, vars: this.vars });
          }

          if (udpSend !== undefined) {
            this.servers.udp.send(Buffer.from(udpSend), action.params.port, action.params.host);
          } else {
            logger.error('action: udp-output has nothing to send');
          }
          break;
        }
        case 'tcp-output': {
          let tcpSend;

          if (action.params.bytes !== undefined) {
            tcpSend = action.params.bytes;
          } else if (action.params.hex !== undefined) {
            tcpSend = hexToBytes(action.params.hex);
          } else {
            // check for string or _string
            tcpSend = resolveTemplatedProperty(action.params, 'string', { msg, vars: this.vars });
          }

          if (tcpSend !== undefined) {
            this.servers.tcp.send(Buffer.from(tcpSend), action.params.port, action.params.host, action.params.slip);
          } else {
            logger.error('action: tcp-output has nothing to send');
          }
          break;
        }
        case 'midi-output':
          try {
            // TODO(jwetzell): add templating to midi-output
            // TODO(jwetzell): see if there is a way to switch ports when outputting
            const midiToSend = MIDIMessage.parseActionParams(action.params);
            if (midiToSend !== undefined) {
              this.servers.midi.send(Buffer.from(midiToSend.bytes));
            }
          } catch (error) {
            logger.error(`action: error outputting midi - ${error}`);
          }
          break;
        case 'log':
          logger.info(`log: ${msg.messageType} - ${msg}`);
          break;
        case 'shell':
          try {
            const command = resolveTemplatedProperty(action.params, 'command', { msg, vars: this.vars });
            if (command !== undefined && command !== '') {
              exec(command);
            }
          } catch (error) {
            logger.error(`action: problem executing shell action - ${error}`);
          }
          break;
        case 'http':
          // TODO(jwetzell): add other http things like query parameters though they can just be included in the url field
          try {
            const url = resolveTemplatedProperty(action.params, 'url', { msg, vars: this.vars });
            const body = resolveTemplatedProperty(action.params, 'body', { msg, vars: this.vars });

            if (url && url !== '') {
              const request = superagent(action.params.method, url);
              if (action.params.contentType !== undefined) {
                request.type(action.params.contentType);
              }

              if (body !== '') {
                request.send(body);
              }

              request.end((error) => {
                if (error) {
                  logger.error(`action: problem executing http action - ${error}`);
                }
              });
            } else {
              logger.error('action: url is empty');
            }
          } catch (error) {
            logger.error(`action: problem executing http action - ${error}`);
          }
          break;
        case 'store':
          try {
            const value = resolveTemplatedProperty(action.params, 'value', { msg, vars: this.vars });
            const key = resolveTemplatedProperty(action.params, 'key', { msg, vars: this.vars });

            if (key !== undefined && value !== undefined) {
              this.vars[key] = value;
            } else {
              logger.error('action: store action missing a key or value');
            }
          } catch (error) {
            logger.error(`action: problem executing store action - ${error}`);
          }
          break;
        case 'delay':
          if (action.params.duration !== undefined && action.params.actions !== undefined) {
            setTimeout(() => {
              action.params.actions.forEach((subAction) => this.doAction(subAction, msg, trigger));
            }, action.params.duration);
          }
          break;
        case 'mqtt-output': {
          const topic = resolveTemplatedProperty(action.params, 'topic', { msg, vars: this.vars });
          const payload = resolveTemplatedProperty(action.params, 'payload', { msg, vars: this.vars });

          if (topic !== undefined && payload !== undefined) {
            this.servers.mqtt.send(topic, payload);
          } else {
            logger.error('action: mqtt-output missing either topic or payload');
          }
          break;
        }
        default:
          logger.error(`action: unhandled action type = ${action.type}`);
      }
    } catch (error) {
      logger.error(`action: problem running action - skipped - ${error}`);
    }
  }
}

module.exports = Router;
