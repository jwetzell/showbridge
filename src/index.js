#!/usr/bin/env node

// communication
const osc = require('osc-min');
const superagent = require('superagent');
const UDPServer = require('./servers/udp-server');
const TCPServer = require('./servers/tcp-server');
const MIDIServer = require('./servers/midi-server');
const WebSocketServer = require('./servers/websocket-server');
const HTTPServer = require('./servers/http-server');
const MQTTServer = require('./servers/mqtt-server');
const MIDIMessage = require('./models/message/midi-message');

// utils
const _ = require('lodash');
const { exec } = require('child_process');
const { readFileSync } = require('fs');
const { resolveTemplatedProperty, hexToBytes } = require('./utils/helper');

// config
const Config = require('./models/config');

// express
const express = require('express');
const app = express();
const server = require('http').createServer(app);

let servers = {
  http: new HTTPServer(server, app),
  udp: new UDPServer(),
  tcp: new TCPServer(),
  ws: new WebSocketServer(server),
  midi: new MIDIServer(),
  mqtt: new MQTTServer(),
};

const vars = {};

let config = {};
//if there is an argument load it as the config
if (process.argv.length === 3) {
  const configFile = process.argv[2];
  const configToLoad = JSON.parse(readFileSync(configFile));
  config = new Config(configToLoad);
} else {
  //if not load a default
  const defaultConfig = require('./config/default.json');
  config = new Config(defaultConfig);
}

servers.http.setConfig(config);

console.debug('HTTP Trigger Summary');
console.debug(config.http.triggers);

console.debug('OSC Trigger Summary');
console.debug(config.osc.triggers);

console.debug('MIDI Trigger Summary');
console.debug(config.midi.triggers);

console.debug('UDP Trigger Summary');
console.debug(config.udp.triggers);

console.debug('TCP Trigger Summary');
console.debug(config.tcp.triggers);

console.debug('MQTT Trigger Summary');
console.debug(config.mqtt.triggers);

servers.tcp.on('message', processMessage);
servers.udp.on('message', processMessage);
servers.midi.on('message', processMessage);
servers.ws.on('message', processMessage);
servers.mqtt.on('message', processMessage);

servers.http.on('message', processMessage);
servers.http.on('reload', (updatedConfig) => {
  try {
    config = updatedConfig;
    reloadServers();
    console.log('Config updated successfully');
  } catch (error) {
    console.error('Problem applying new config');
  }
});

reloadServers();

function reloadServers() {
  servers.tcp.reload(config.tcp.params);
  servers.udp.reload(config.udp.params);
  servers.http.reload(config.http.params);
  servers.midi.reload();
  servers.mqtt.reload(config.mqtt.params);
}

/** Message Processing */
function processMessage(msg, messageType) {
  const triggers = config[messageType]?.triggers;
  if (triggers) {
    for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {
      const trigger = triggers[triggerIndex];
      if (trigger.shouldFire(msg, messageType)) {
        console.debug(`${messageType}-trigger-${triggerIndex}: fired`);
        trigger.actions.forEach((action) => doAction(action, msg, messageType, trigger));
      } else {
        console.debug(`${messageType}-trigger-${triggerIndex}: not fired`);
      }
    }
  }
}

// Action
function doAction(action, msg, messageType, trigger) {
  if (!action.enabled) {
    console.debug(`action: ${action.type} is disabled skipping...`);
    return;
  }
  console.debug(`action: ${action.type} triggered from ${trigger.type}`);
  switch (action.type) {
    case 'forward':
      try {
        let msgToForward;
        if (messageType === 'osc') {
          msgToForward = msg.getBuffer();
        } else if (messageType === 'udp' || messageType === 'tcp') {
          msgToForward = msg.bytes;
        }

        if (msgToForward) {
          if (action.params.protocol === 'udp') {
            servers.udp.send(msgToForward, action.params.port, action.params.host);
          } else if (action.params.protocol === 'tcp') {
            servers.tcp.send(
              msgToForward,
              action.params.port,
              action.params.host,
              messageType === 'osc' ? true : false
            );
          } else {
            console.error(`unhandled forward protocol = ${action.params.protocol}`);
          }
        } else {
          console.error('this is not a forwardable message type');
        }
      } catch (error) {
        console.error('error outputting osc');
        console.error(error);
      }
      break;
    case 'osc-output':
      try {
        const address = resolveTemplatedProperty(action.params, 'address', { msg, vars });

        if (!address) {
          console.error('either address or _address property need to be set for osc-output action');
          return;
        }

        const args = resolveTemplatedProperty(action.params, 'args', { msg, vars });

        const outBuff = osc.toBuffer({
          address,
          args,
        });

        if (action.params.protocol === 'udp') {
          servers.udp.send(outBuff, action.params.port, action.params.host);
        } else if (action.params.protocol === 'tcp') {
          servers.tcp.send(outBuff, action.params.port, action.params.host, true);
        } else {
          console.error(`unhandled osc output protocol = ${action.params.protocol}`);
        }
      } catch (error) {
        console.error('error outputting osc');
        console.error(error);
      }
      break;
    case 'udp-output':
      let udpSend;

      if (action.params.bytes) {
        udpSend = action.params.bytes;
      } else if (action.params.hex) {
        udpSend = hexToBytes(action.params.hex);
      } else {
        // check for string or _string
        udpSend = resolveTemplatedProperty(action.params, 'string', { msg, vars });
      }

      if (udpSend) {
        servers.udp.send(Buffer.from(udpSend), action.params.port, action.params.host);
      } else {
        console.error('udp-output has nothing to send');
      }
      break;
    case 'tcp-output':
      let tcpSend;

      if (action.params.bytes) {
        tcpSend = action.params.bytes;
      } else if (action.params.hex) {
        tcpSend = hexToBytes(action.params.hex);
      } else {
        // check for string or _string
        tcpSend = resolveTemplatedProperty(action.params, 'string', { msg, vars });
      }

      if (tcpSend) {
        servers.tcp.send(Buffer.from(tcpSend), action.params.port, action.params.host, action.params.slip);
      } else {
        console.error('tcp-output has nothing to send');
      }
      break;
    case 'midi-output':
      try {
        // TODO(jwetzell): see if there is a way to switch ports when outputting
        const midiToSend = MIDIMessage.parseActionParams(action.params);
        if (midiToSend) {
          servers.midi.output.sendMessage(Buffer.from(midiToSend.bytes));
        }
      } catch (error) {
        console.error('error outputting midi');
        console.error(error);
      }
      break;
    case 'log':
      console.info(`${messageType}: ${msg}`);
      break;
    case 'shell':
      try {
        const command = resolveTemplatedProperty(action.params, 'command', { msg, vars });
        if (command && command !== '') {
          exec(command);
        }
      } catch (error) {
        console.error('problem executing shell action');
        console.error(error);
      }
      break;
    case 'http':
      //TODO(jwetzell): add other http things like query parameters although they can just be included in the url field
      try {
        const url = resolveTemplatedProperty(action.params, 'url', { msg, vars });
        const body = resolveTemplatedProperty(action.params, 'body', { msg, vars });

        if (url && url !== '') {
          const request = superagent(action.params.method, url);
          if (action.params.contentType) {
            request.type(action.params.contentType);
          }

          if (body !== '') {
            request.send(body);
          }

          request.end((err, res) => {
            if (!!err) {
              console.error(err);
            }
          });
        } else {
          console.error('url is empty');
        }
      } catch (error) {
        console.error('problem executing http action');
        console.error(error);
      }
      break;
    case 'store':
      try {
        const value = resolveTemplatedProperty(action.params, 'value', { msg, vars });
        const key = resolveTemplatedProperty(action.params, 'key', { msg, vars });

        if (key && value) {
          vars[key] = value;
        } else {
          console.error('store action missing a key or value');
        }
      } catch (error) {
        console.error(error);
      }
      break;
    case 'delay':
      if (action.params.duration && action.params.actions) {
        setTimeout(() => {
          action.params.actions.forEach((action) => doAction(action, msg, messageType, trigger));
        }, action.params.duration);
      }
      break;
    case 'mqtt-output':
      const topic = resolveTemplatedProperty(action.params, 'topic', { msg, vars });
      const payload = resolveTemplatedProperty(action.params, 'payload', { msg, vars });

      if (topic && payload) {
        servers.mqtt.send(topic, payload);
      } else {
        console.error('mqtt-output missing either topic or payload');
      }
    default:
      console.error(`unhandled action type = ${action.type}`);
  }
}
