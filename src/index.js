import * as net from 'net';
import * as udp from 'dgram';
import * as osc from 'osc-min';
import * as utils from './utils.mjs';
import * as http from 'http';
import _ from 'lodash';
import midi from 'midi';
import * as midiUtils from './midi-utils.mjs';
import { readFile } from 'fs/promises';
let configFile = 'src/config.json';

if (process.argv.length === 3) {
  configFile = process.argv[2];
}

const config = JSON.parse(await readFile(configFile));

const msgTypeSupportedTrigger = {
  osc: ['osc-regex', 'host'],
  midi: ['midi-bytes-equal'],
};

const midiOutput = new midi.Output();
midiOutput.openVirtualPort('oscee Output');

const midiInput = new midi.Input();
midiInput.openVirtualPort('oscee Input');

printMIDIDevices();

console.log('OSC Trigger Summary');
utils.printTriggers(config.osc.triggers);

console.log('MIDI Trigger Summary');
utils.printTriggers(config.midi.triggers);

//TODO(jwetzell): add TCP support
/** TCP SERVER */
// const tcpServer = net.createServer();
// tcpServer.on('connection', (conn) => {
//   console.log(conn);

//   console.log(`new tcp connection from ${conn.remoteAddress}`);

//   conn.on('data', onConnData);
//   conn.once('close', onConnClose);
//   conn.on('error', onConnError);

//   function onConnData(msg) {
//     console.log(`connection data from ${conn.remoteAddress}:`);
//   }

//   function onConnClose() {
//     console.log(`connection from ${conn.remoteAddress} closed`);
//   }

//   function onConnError(err) {
//     console.log(`Connection ${conn.remoteAddress} error: ${err.message}`);
//   }
// });

// tcpServer.listen(config.osc.tcp.port, () => {
//   console.log(`tcp server listening on port ${tcpServer.address().port}`);
// });

/** UDP SERVER */
const udpServer = udp.createSocket('udp4');

udpServer.bind(config.osc.udp.port, () => {
  console.log(`udp server listening on port ${udpServer.address().port}`);
  udpServer.on('message', (msg, rinfo) => {
    processMessage(osc.fromBuffer(msg), 'osc', {
      protocol: 'udp',
      address: rinfo.address,
      port: rinfo.port,
    });
  });
});

midiInput.on('message', (deltaTime, msg) => {
  const parsedMIDI = midiUtils.parseMIDIMessage(msg);
  processMessage(parsedMIDI, 'midi', null);
});

/** Message Processing */

function processMessage(msg, messageType, msgInfo) {
  //TODO(jwetzell): undefined checks
  switch (messageType) {
    case 'osc':
      console.log(`osc message received from ${msgInfo.address}:${msgInfo.port} via ${msgInfo.protocol}`);
      break;
    case 'midi':
      console.log('midi message received');
      break;
    default:
      console.log(`unhandled message type = ${messageType}`);
  }

  config[messageType].triggers.forEach((trigger) => {
    if (!trigger.enabled) {
      console.log('trigger disabled skipping...');
      return;
    }
    switch (trigger.type) {
      case 'osc-regex':
        if (messageType === 'osc') {
          const regex = new RegExp(trigger.params.pattern, 'g');
          const matchPropertyValue = _.get(msg, trigger.params.matchProperty);
          if (!matchPropertyValue) {
            console.error('osc-regex is configured to look at a property that does not exist on this message.');
            return;
          }

          if (regex.test(matchPropertyValue) && !!trigger.actions) {
            trigger.actions.forEach((action) => doAction(action, msg, 'osc', trigger));
          }
        } else {
          console.error('osc-regex trigger attempted on non-osc message type');
        }
        break;
      case 'host':
        if (messageType === 'osc') {
          const host = trigger.params.host;
          if (msgInfo.address === trigger.params.host && trigger.actions) {
            trigger.actions.forEach((action) => doAction(action, msg, 'osc', trigger));
          }
        } else {
          console.error('host trigger attempted on message type that does not have host information');
        }
        break;
      case 'midi-bytes-equals':
        if (messageType === 'midi') {
          if (midiUtils.equals(msg, trigger.params.data)) {
            trigger.actions.forEach((action) => doAction(action, msg, 'midi', trigger));
          }
        }
        break;
      case 'midi-note-on':
        if (messageType === 'midi' && msg.status === 'note_on') {
          if (msg.note === trigger.params.note) {
            trigger.actions.forEach((action) => doAction(action, msg, 'midi', trigger));
          }
        }
        break;
      case 'midi-note-off':
        if (messageType === 'midi' && msg.status === 'note_off') {
          if (msg.note === trigger.params.note) {
            trigger.actions.forEach((action) => doAction(action, msg, 'midi', trigger));
          }
        }
        break;
      default:
        console.log(`unhandled trigger type = ${trigger.type}`);
    }
  });
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
        const outBuff = osc.toBuffer({
          address: action.params.address,
          args: action.params.args,
        });

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
      console.log(msg);
      utils.printMessage(msg, messageType);
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
