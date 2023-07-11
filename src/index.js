#!/usr/bin/env node
/* eslint-disable no-use-before-define */

const osc = require('osc-min');
const superagent = require('superagent');
const { exec } = require('child_process');
const { readFileSync } = require('fs');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const UDPServer = require('./servers/udp-server');
const TCPServer = require('./servers/tcp-server');
const MIDIServer = require('./servers/midi-server');
const WebSocketServer = require('./servers/websocket-server');
const HTTPServer = require('./servers/http-server');
const MQTTClient = require('./servers/mqtt-client');
const MIDIMessage = require('./models/message/midi-message');

const { resolveTemplatedProperty, hexToBytes } = require('./utils/helper');
const { logger } = require('./utils/helper');

const Config = require('./models/config');

const servers = {
  http: new HTTPServer(server, app),
  udp: new UDPServer(),
  tcp: new TCPServer(),
  ws: new WebSocketServer(server),
  midi: new MIDIServer(),
  mqtt: new MQTTClient(),
};

const vars = {};

let config = {};
// if there is an argument load it as the config
if (process.argv.length === 3) {
  const configFile = process.argv[2];
  const configToLoad = JSON.parse(readFileSync(configFile));
  config = new Config(configToLoad);
} else {
  // if not load a default
  // eslint-disable-next-line global-require
  const defaultConfig = require('./config/default.json');
  config = new Config(defaultConfig);
}

servers.http.setConfig(config);

// TODO(jwetzell): find a way to print these out nicely
// logger.debug('app: HTTP Trigger Summary');
// logger.debug(config.http.triggers);

// logger.debug('app: OSC Trigger Summary');
// logger.debug(config.osc.triggers);

// logger.debug('app: MIDI Trigger Summary');
// logger.debug(config.midi.triggers);

// logger.debug('app: UDP Trigger Summary');
// logger.debug(config.udp.triggers);

// logger.debug('app: TCP Trigger Summary');
// logger.debug(config.tcp.triggers);

// logger.debug('app: MQTT Trigger Summary');
// logger.debug(config.mqtt.triggers);

/** Message Processing */
function processMessage(msg) {
  const triggers = config[msg.messageType]?.triggers;
  if (triggers !== undefined && triggers.length > 0) {
    for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex += 1) {
      const trigger = triggers[triggerIndex];
      try {
        if (trigger.shouldFire(msg)) {
          logger.trace(`${msg.messageType}-trigger-${triggerIndex}: fired`);
          trigger.actions.forEach((action) => doAction(action, msg, trigger));
        } else {
          logger.trace(`${msg.messageType}-trigger-${triggerIndex}: not fired`);
        }
      } catch (error) {
        logger.error(`trigger: problem evaluating trigger - ${error}`);
      }
    }
  }
}

// NOTE(jwetzell): listen for all messages on servers
Object.keys(servers).forEach((messageType) => {
  servers[messageType].on('message', processMessage);
});

function reloadServers() {
  servers.udp.reload(config.udp.params);
  servers.tcp.reload(config.tcp.params);
  servers.http.reload(config.http.params);
  servers.midi.reload();
  servers.mqtt.reload(config.mqtt.params);
}

servers.http.on('reload', (updatedConfig) => {
  try {
    config = updatedConfig;
    reloadServers();
    logger.debug('app: config updated successfully');
  } catch (error) {
    logger.error('app: problem applying new config');
  }
});

reloadServers();

// Action
function doAction(action, _msg, trigger) {
  if (!action.enabled) {
    logger.debug(`action: ${action.type} is disabled skipping...`);
    return;
  }
  logger.debug(`action: ${action.type} triggered from ${trigger.type}`);

  try {
    const msg = action.getTransformedMessage(_msg, vars);

    switch (action.type) {
      case 'forward':
        try {
          const msgToForward = msg.bytes;

          if (msgToForward !== undefined) {
            if (action.params.protocol === 'udp') {
              servers.udp.send(msgToForward, action.params.port, action.params.host);
            } else if (action.params.protocol === 'tcp') {
              servers.tcp.send(msgToForward, action.params.port, action.params.host, msg.messageType === 'osc');
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
          const address = resolveTemplatedProperty(action.params, 'address', { msg, vars });

          if (address === undefined) {
            logger.error('action: either address or _address property need to be set for osc-output action');
            return;
          }

          let args = resolveTemplatedProperty(action.params, 'args', { msg, vars });
          if (args === undefined) {
            args = [];
          }

          const outBuff = osc.toBuffer({
            address,
            args,
          });

          if (action.params.protocol === 'udp') {
            servers.udp.send(outBuff, action.params.port, action.params.host);
          } else if (action.params.protocol === 'tcp') {
            servers.tcp.send(outBuff, action.params.port, action.params.host, true);
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
          udpSend = resolveTemplatedProperty(action.params, 'string', { msg, vars });
        }

        if (udpSend !== undefined) {
          servers.udp.send(Buffer.from(udpSend), action.params.port, action.params.host);
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
          tcpSend = resolveTemplatedProperty(action.params, 'string', { msg, vars });
        }

        if (tcpSend !== undefined) {
          servers.tcp.send(Buffer.from(tcpSend), action.params.port, action.params.host, action.params.slip);
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
            servers.midi.send(Buffer.from(midiToSend.bytes));
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
          const command = resolveTemplatedProperty(action.params, 'command', { msg, vars });
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
          const url = resolveTemplatedProperty(action.params, 'url', { msg, vars });
          const body = resolveTemplatedProperty(action.params, 'body', { msg, vars });

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
          const value = resolveTemplatedProperty(action.params, 'value', { msg, vars });
          const key = resolveTemplatedProperty(action.params, 'key', { msg, vars });

          if (key !== undefined && value !== undefined) {
            vars[key] = value;
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
            action.params.actions.forEach((subAction) => doAction(subAction, msg, trigger));
          }, action.params.duration);
        }
        break;
      case 'mqtt-output': {
        const topic = resolveTemplatedProperty(action.params, 'topic', { msg, vars });
        const payload = resolveTemplatedProperty(action.params, 'payload', { msg, vars });

        if (topic !== undefined && payload !== undefined) {
          servers.mqtt.send(topic, payload);
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
