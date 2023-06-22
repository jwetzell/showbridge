// communication
const osc = require('osc-min');
const superagent = require('superagent');
const UDPServer = require('./servers/udp-server');
const TCPServer = require('./servers/tcp-server');
const MIDIServer = require('./servers/midi-server');
const WebSocketServer = require('./servers/websocket-server');
const HTTPServer = require('./servers/http-server');

// utils
const _ = require('lodash');
const { exec } = require('child_process');
const { readFileSync } = require('fs');

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
};

let config = {};
//if there is an argument load it as the config
if (process.argv.length === 3) {
  const configFile = process.argv[2];
  const configToLoad = JSON.parse(readFileSync(configFile));
  config = new Config(configToLoad);
} else {
  //if not load a default
  const defaultConfig = require('./config-default.json');
  config = new Config(defaultConfig);
}

servers.http.setConfig(config);

console.debug('HTTP Trigger Summary');
console.debug(config.http.triggers);

console.debug('OSC Trigger Summary');
console.debug(config.osc.triggers);

console.debug('MIDI Trigger Summary');
console.debug(config.midi.triggers);

console.debug('MIDI Trigger Summary');
console.debug(config.midi.triggers);

servers.tcp.on('message', processMessage);
servers.udp.on('message', processMessage);
servers.midi.on('message', processMessage);
servers.ws.on('message', processMessage);

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
}

/** Message Processing */
function processMessage(msg, messageType) {
  const triggers = config[messageType]?.triggers;
  if (triggers) {
    for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {
      const trigger = triggers[triggerIndex];
      if (trigger.shouldFire(msg, messageType)) {
        trigger.actions.forEach((action) => doAction(action, msg, messageType, trigger));
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
          //TODO(jwetzell): implement TCP
          if (action.params.protocol === 'udp') {
            servers.udp.send(msgToForward, action.params.port, action.params.host);
          } else {
            console.error(`unhandled foward protocol = ${action.params.protocol}`);
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
        let address = '';
        if (!!action.params._address) {
          const _address = _.template(action.params._address);
          address = _address({ msg });
        } else if (!!action.params.address) {
          address = action.params.address;
        } else {
          console.error('either address or _address property need to be set for osc-output action');
          return;
        }

        let args = [];

        if (!!action.params._args) {
          action.params._args.forEach((arg) => {
            if (typeof arg === 'string') {
              const _arg = _.template(arg);
              args.push(_arg({ msg }));
            } else {
              args.push(arg);
            }
          });
        } else if (!!action.params.args) {
          args = action.params.args;
        }

        const outBuff = osc.toBuffer({
          address,
          args,
        });

        //TODO(jwetzell): add TCP support
        if (action.params.protocol === 'udp') {
          servers.udp.send(outBuff, action.params.port, action.params.host);
        } else {
          console.error(`unhandled osc output protocol = ${action.params.protocol}`);
        }
      } catch (error) {
        console.error('error outputting osc');
        console.error(error);
      }
      break;
    case 'midi-output':
      try {
        // TODO(jwetzell): see if there is a way to switch ports when outputting
        servers.midi.output.sendMessage(action.params.bytes);
      } catch (error) {
        console.error('error outputting midi');
        console.error(error);
      }
      break;
    case 'log':
      console.info(`${messageType}: ${msg}`);
      break;
    case 'shell':
      let command = '';

      try {
        if (!!action.params._command) {
          command = _.template(action.params._command)({ msg });
        } else if (!!action.params.command) {
          command = action.params.command;
        } else {
          console.error('shell action with no command configured');
        }
        if (command !== '') {
          exec(command);
        }
      } catch (error) {
        console.error('problem executing shell action');
        console.error(error);
      }
      break;
    case 'http':
      //TODO(jwetzell): add other http things like query parameters although they can just be included in the url field
      let url = '';
      let body = '';

      try {
        if (!!action.params._url) {
          url = _.template(action.params._url)({ msg });
        } else if (!!action.params.url) {
          url = action.params.url;
        } else {
          console.error('http action with no url configured');
        }

        if (!!action.params._body) {
          body = _.template(action.params._body)({ msg });
        } else if (!!action.params.body) {
          body = action.params.body;
        }

        if (url !== '') {
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
            } else {
              console.debug(`${action.params.method} request made to ${url}`);
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
    default:
      console.error(`unhandled action type = ${action.type}`);
  }
}
