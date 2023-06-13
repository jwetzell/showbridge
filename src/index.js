import * as udp from 'dgram';
import { readFile } from 'fs/promises';
import _ from 'lodash';
import midi from 'midi';
import * as net from 'net';
import * as osc from 'osc-min';
import * as midiUtils from './midi-utils.mjs';
import * as utils from './utils.mjs';
import { exec } from 'child_process';
let configFile = 'src/config.json';

if (process.argv.length === 3) {
  configFile = process.argv[2];
}

const config = JSON.parse(await readFile(configFile));

const midiOutput = new midi.Output();
midiOutput.openVirtualPort('oscee Output');

const midiInput = new midi.Input();
midiInput.openVirtualPort('oscee Input');

printMIDIDevices();

//TODO(jwetzell): make sure these are actually defined
console.log('OSC Trigger Summary');
utils.printTriggers(config.osc.triggers);

//TODO(jwetzell): make sure these are actually defined
console.log('MIDI Trigger Summary');
utils.printTriggers(config.midi.triggers);

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
      console.error('PROBLEM PROCESSING MESSAGE');
      console.error(error);
    }
  });
});

midiInput.on('message', (deltaTime, msg) => {
  const parsedMIDI = midiUtils.parseMIDIMessage(msg);
  try {
    processMessage(parsedMIDI, 'midi');
  } catch (error) {
    console.error('PROBLEM PROCESSING MESSAGE');
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

  for (let triggerIndex = 0; triggerIndex < config[messageType].triggers.length; triggerIndex++) {
    let fire = false;
    const trigger = config[messageType].triggers[triggerIndex];

    if (!trigger.enabled) {
      console.log(`trigger ${triggerIndex}:${trigger.type} disabled skipping...`);
      fire = false;
      continue;
    }

    switch (trigger.type) {
      case 'regex':
        if (!!trigger.params) {
          if (!!trigger.params.patterns && !!trigger.params.properties) {
            if (trigger.params.patterns.length === trigger.params.properties.length) {
              for (let i = 0; i < trigger.params.patterns.length; i++) {
                const pattern = trigger.params.patterns[i];
                const property = trigger.params.properties[i];

                const regex = new RegExp(pattern, 'g');
                const matchPropertyValue = _.get(msg, property);
                if (!matchPropertyValue) {
                  console.error('regex is configured to look at a property that does not exist on this message.');
                  fire = false;
                }

                if (!regex.test(matchPropertyValue)) {
                  fire = false;
                }
              }
              // all properties match all patterns
              fire = true;
            }
          }
        }
        break;
      case 'host':
        if (!!msg.sender) {
          const host = trigger.params.host;
          if (msg.sender.address === trigger.params.host && trigger.actions) {
            fire = true;
          }
        } else {
          console.error('host trigger attempted on message type that does not have host information');
        }
        break;
      case 'midi-bytes-equals':
        if (messageType === 'midi') {
          if (midiUtils.equals(msg, trigger.params.data)) {
            fire = true;
          }
        }
        break;
      case 'midi-note-on':
        if (messageType === 'midi' && msg.status === 'note_on') {
          if (!!trigger.params) {
            if (!!trigger.params.note) {
              //trigger params specify a note (the incoming message must match in order to fire actions)
              if (msg.note === trigger.params.note) {
                fire = true;
              }
            } else {
              //no note specified always fire actions
              fire = true;
            }
          }
        }
        break;
      case 'midi-note-off':
        if (messageType === 'midi' && msg.status === 'note_off') {
          if (!!trigger.params) {
            if (!!trigger.params.note) {
              //trigger params specify a note (the incoming message must match in order to fire actions)
              if (msg.note === trigger.params.note) {
                fire = true;
              }
            } else {
              //no note specified always fire actions
              fire = true;
            }
          }
        }
        break;
      default:
        console.log(`unhandled trigger type = ${trigger.type}`);
        fire = false;
    }
    if (fire) {
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
        midiOutput.openPort(action.params.port);
        midiOutput.sendMessage(action.params.data);
        midiOutput.closePort(action.params.port);
      } catch (error) {
        console.log('error outputting midi');
        console.log(error);
      }
      break;
    case 'log':
      console.log(`log action triggered from trigger ${trigger.type}`);
      utils.printMessage(msg, messageType);
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

/** Helpers */
function printMIDIDevices() {
  const outputs = [];
  const inputs = [];

  for (let i = 0; i < midiInput.getPortCount(); i++) {
    inputs.push(midiInput.getPortName(i));
  }
  console.log('MIDI Inputs');
  utils.printMIDIInputs(inputs);

  for (let i = 0; i < midiOutput.getPortCount(); i++) {
    outputs.push(midiOutput.getPortName(i));
  }
  console.log('MIDI Outputs');
  utils.printMIDIOutputs(outputs);
}
