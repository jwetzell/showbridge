const udp = require('dgram');
const net = require('net');
const osc = require('osc-min');
const _ = require('lodash');
const { exec } = require('child_process');
const { readFileSync } = require('fs');
const path = require('path');
const pino = require('pino');
const MidiMessage = require('./models/midi-message');
const OscMessage = require('./models/osc-message');
const HttpMessage = require('./models/http-message');
const Config = require('./models/config');
const midi = require('./midi.js');

let servers = {
  http: undefined,
  osc: {
    udp: undefined,
    tcp: undefined,
  },
};

const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

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

if (!!config.logLevel) {
  logger.level = config.logLevel;
} else {
  logger.level = 10;
}

printMIDIDevices();

/** Helpers */
function printMIDIDevices() {
  const inputs = [];

  for (let i = 0; i < midi.input.getPortCount(); i++) {
    inputs.push(midi.input.getPortName(i));
  }
  logger.debug('MIDI Inputs');
  logger.debug(inputs);

  const outputs = [];
  for (let i = 0; i < midi.output.getPortCount(); i++) {
    outputs.push(midi.output.getPortName(i));
  }
  logger.debug('MIDI Outputs');
  logger.debug(outputs);
}

logger.debug('HTTP Trigger Summary');
logger.debug(config.http.triggers);

logger.debug('OSC Trigger Summary');
logger.debug(config.osc.triggers);

logger.debug('MIDI Trigger Summary');
logger.debug(config.midi.triggers);

/** TCP SERVER */

reloadTcp();
function reloadTcp() {
  if (servers.osc.tcp) {
    servers.osc.tcp.close();
  }
  servers.osc.tcp = net.createServer();
  servers.osc.tcp.on('connection', (conn) => {
    conn.on('data', onConnData);

    function onConnData(msg) {
      try {
        const oscMsg = new OscMessage(osc.fromBuffer(msg, true), {
          protocol: 'tcp',
          address: conn.remoteAddress,
          port: conn.remotePort,
        });
        processMessage(oscMsg, 'osc');
      } catch (error) {
        logger.error('PROBLEM PROCESSING MESSAGE');
        logger.error(error);
      }
    }
  });

  servers.osc.tcp.listen(config.osc.params.tcpPort, () => {
    logger.info(`tcp server setup on port ${servers.osc.tcp.address().port}`);
  });
}

/** UDP SERVER */
reloadUdp();

function reloadUdp() {
  if (servers.osc.udp) {
    servers.osc.udp.close();
  }
  servers.osc.udp = udp.createSocket('udp4');
  servers.osc.udp.bind(config.osc.params.udpPort, () => {
    logger.info(`udp server setup on port ${servers.osc.udp.address().port}`);
    servers.osc.udp.on('message', (msg, rinfo) => {
      try {
        const oscMsg = new OscMessage(osc.fromBuffer(msg, true), {
          protocol: 'udp',
          address: rinfo.address,
          port: rinfo.port,
        });
        processMessage(oscMsg, 'osc');
      } catch (error) {
        logger.error('PROBLEM PROCESSING OSC MESSAGE');
        logger.error(error);
      }
    });
  });
}

midi.input.on('message', (deltaTime, msg) => {
  try {
    const parsedMIDI = new MidiMessage(msg);
    processMessage(parsedMIDI, 'midi');
  } catch (error) {
    logger.error('PROBLEM PROCESSING MIDI MESSAGE');
    logger.error(error);
  }
});

/** Message Processing */

function processMessage(msg, messageType) {
  const triggers = config[messageType]?.triggers;
  if (triggers) {
    for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {
      const trigger = triggers[triggerIndex];
      if (trigger.shouldFire(msg, messageType)) {
        logger.debug(`trigger ${triggerIndex}:${trigger.type} fired`);
        trigger.actions.forEach((action) => doAction(action, msg, messageType, trigger));
      } else {
        logger.debug(`trigger ${triggerIndex}:${trigger.type} not fired`);
      }
    }
  }
}

function doAction(action, msg, messageType, trigger) {
  if (!action.enabled) {
    logger.debug(`action: ${action.type} is disabled skipping...`);
    return;
  }

  switch (action.type) {
    case 'osc-forward':
      try {
        if (action.params.protocol === 'udp') {
          if (messageType === 'osc') {
            const outBuff = osc.toBuffer(msg);
            servers.osc.udp.send(outBuff, action.params.port, action.params.host);
          } else {
            logger.error('what does osc-forward do if there was no input osc to forward?');
          }
        }
      } catch (error) {
        logger.error('error outputting osc');
        logger.error(error);
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
          logger.error('either address or _address property need to be set for osc-output action');
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
          servers.osc.udp.send(outBuff, action.params.port, action.params.host);
        }
      } catch (error) {
        logger.error('error outputting osc');
        logger.error(error);
      }
      break;
    case 'midi-output':
      try {
        midi.output.openPort(action.params.port);
        midi.output.sendMessage(action.params.data);
        midi.output.closePort(action.params.port);
      } catch (error) {
        logger.error('error outputting midi');
        logger.error(error);
      }
      break;
    case 'log':
      logger.info(`log action triggered from trigger ${trigger.type}`);
      logger.info(`${messageType}: ${msg}`);
      break;
    case 'shell':
      let command = '';

      try {
        if (!!action.params._command) {
          command = _.template(action.params._command)({ msg });
        } else if (!!action.params.command) {
          command = action.params.command;
        } else {
          logger.error('shell action with no command configured');
        }
        if (command !== '') {
          exec(command);
        }
      } catch (error) {
        logger.error('problem executing shell action');
        logger.error(error);
      }
      break;
    default:
      logger.error(`unhandled action type = ${action.type}`);
  }
}

// API Server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('ws');
servers.ws = new Server({
  server: server,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/config', (req, res, next) => {
  try {
    const configToUpdate = new Config(req.body);
    config = configToUpdate;
    //TODO(jwetzell): detect errors reloading sockets
    reloadUdp();
    reloadTcp();
    reloadHttp();
    logger.info('Config successfully updated.');
    res.status(200).send({ msg: 'ok' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({
      msg: 'invalid config',
      errorType: 'config_validation',
      errors: error,
    });
  }
});

app.get('/config', (req, res) => {
  res.send(config);
});

app.get('/config/schema', (req, res) => {
  res.send(config.getSchema());
});

app.get('/*', (req, res) => {
  processMessage(new HttpMessage(req), 'http');
  res.status(200).send({ msg: 'ok' });
});

app.post('/*', (req, res) => {
  processMessage(new HttpMessage(req), 'http');
  res.status(200).send({ msg: 'ok' });
});

servers.ws.on('connection', (ws) => {
  ws.on('message', (msgBuffer) => {
    let msg = msgBuffer.toString();
    try {
      logger.debug('trying to parse incoming message as JSON');
      msg = JSON.parse(msg);
    } catch (error) {
      logger.error('JSON parse failed leaving as string');
    }
    logger.debug(msg);
  });
});

reloadHttp();
function reloadHttp() {
  if (servers.http) {
    servers.http.close();
  }
  servers.http = server.listen(config.http.params.port, () => {
    logger.info(`web interface listening on port ${config.http.params.port}`);
  });
}
