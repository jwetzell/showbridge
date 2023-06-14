const udp = require('dgram');
const net = require('net');
const osc = require('osc-min');
const _ = require('lodash');
const { exec } = require('child_process');
const MidiMessage = require('./models/midi-message');
const { readFileSync } = require('fs');
const Config = require('./models/config');
const midi = require('./midi.js');

let config;
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

//TODO(jwetzell): make sure these are actually defined
console.log('OSC Trigger Summary');
console.log(config.osc.triggers);

//TODO(jwetzell): make sure these are actually defined
console.log('MIDI Trigger Summary');
console.log(config.midi.triggers);

/** TCP SERVER */
const tcpServer = net.createServer();
tcpServer.on('connection', (conn) => {
  conn.on('data', onConnData);

  function onConnData(msg) {
    const oscMsg = osc.fromBuffer(msg);
    console.log(oscMsg);
    oscMsg.sender = {
      protocol: 'tcp',
      address: conn.remoteAddress,
      port: conn.remotePort,
    };
    oscMsg.args = oscMsg.args.map((arg) => arg.value);
    try {
      processMessage(oscMsg, 'osc');
    } catch (error) {
      console.error('PROBLEM PROCESSING MESSAGE');
      console.error(error);
    }
  }
});

tcpServer.listen(config.osc.tcp.port, () => {
  console.log(`tcp server listening on port ${tcpServer.address().port}`);
});

/** UDP SERVER */
const udpServer = udp.createSocket('udp4');

udpServer.bind(config.osc.udp.port, () => {
  console.log(`udp server listening on port ${udpServer.address().port}`);
  udpServer.on('message', (msg, rinfo) => {
    const oscMsg = osc.fromBuffer(msg);
    oscMsg.sender = {
      protocol: 'udp',
      address: rinfo.address,
      port: rinfo.port,
    };

    oscMsg.args = oscMsg.args.map((arg) => arg.value);
    try {
      processMessage(oscMsg, 'osc');
    } catch (error) {
      console.error('PROBLEM PROCESSING OSC MESSAGE');
      console.error(error);
    }
  });
});

midi.input.on('message', (deltaTime, msg) => {
  try {
    const parsedMIDI = new MidiMessage(msg);
    processMessage(parsedMIDI, 'midi');
  } catch (error) {
    console.error('PROBLEM PROCESSING MIDI MESSAGE');
    console.error(error);
  }
});

/** Message Processing */

function processMessage(msg, messageType) {
  //TODO(jwetzell): undefined checks
  switch (messageType) {
    case 'osc':
      console.log(`osc message received from ${msg.sender.address}:${msg.sender.port} via ${msg.sender.protocol}`);
      break;
    case 'midi':
      console.log('midi message received');
      break;
    default:
      console.log(`unhandled message type = ${messageType}`);
  }
  const triggers = config[messageType].triggers;
  for (let triggerIndex = 0; triggerIndex < triggers.length; triggerIndex++) {
    const trigger = triggers[triggerIndex];
    if (trigger.shouldFire(msg, messageType)) {
      console.log(`trigger ${triggerIndex}:${trigger.type} fired`);
      trigger.actions.forEach((action) => doAction(action, msg, messageType, trigger));
    } else {
      console.log(`trigger ${triggerIndex}:${trigger.type} not fired`);
    }
  }
}

function doAction(action, msg, messageType, trigger) {
  if (!action.enabled) {
    console.log(`action: ${action.type} is disabled skipping...`);
    return;
  }

  switch (action.type) {
    case 'osc-forward':
      try {
        if (action.params.protocol === 'udp') {
          if (messageType === 'osc') {
            const outBuff = osc.toBuffer(msg);
            udpServer.send(outBuff, action.params.port, action.params.host);
          } else {
            console.error('what does osc-forward do if there was no input osc to forward?');
          }
        }
      } catch (error) {
        console.log('error outputting osc');
        console.log(error);
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
          udpServer.send(outBuff, action.params.port, action.params.host);
        }
      } catch (error) {
        console.log('error outputting osc');
        console.log(error);
      }
      break;
    case 'midi-output':
      try {
        midi.output.openPort(action.params.port);
        midi.output.sendMessage(action.params.data);
        midi.output.closePort(action.params.port);
      } catch (error) {
        console.log('error outputting midi');
        console.log(error);
      }
      break;
    case 'log':
      console.log(`log action triggered from trigger ${trigger.type}`);
      console.log(msg);
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
    default:
      console.log(`unhandled action type = ${action.type}`);
  }
}
