const midi = require('midi');

const output = new midi.Output();
output.openVirtualPort('oscee Output');

const input = new midi.Input();
input.openVirtualPort('oscee Input');

printMIDIDevices();

function parseMIDIMessage(bytes) {
  const parsedMsg = {
    channel: bytes[0] & 0xf,
    bytes: bytes,
  };

  switch (bytes[0] >> 4) {
    case 8: //note off
      parsedMsg.status = 'note_off';
      parsedMsg.note = bytes[1];
      parsedMsg.velocity = bytes[2];
      break;
    case 9: //note on
      parsedMsg.status = 'note_on';
      parsedMsg.note = bytes[1];
      parsedMsg.velocity = bytes[2];
      break;
    case 10:
      parsedMsg.status = 'polyphonic_aftertouch';
      parsedMsg.note = bytes[1];
      parsedMsg.pressure = bytes[2];
      break;
    case 11:
      parsedMsg.status = 'control_change';
      parsedMsg.control = bytes[1];
      parsedMsg.value = bytes[2];
      break;
    case 12:
      parsedMsg.status = 'program_change';
      parsedMsg.program = bytes[1];
      break;
    case 13:
      parsedMsg.status = 'channel_aftertouch';
      parsedMsg.pressure = bytes[1];
      break;
    case 14:
      parsedMsg.status = 'pitch_bend';
      parsedMsg.value = bytes[1] + (bytes[2] << 7);
      break;
    default:
      console.log('unhandled midi status: ' + status);
  }
  return parsedMsg;
}

function equals(msg, bytes) {
  for (let i = 0; i < msg.bytes.length; i++) {
    if (msg.bytes[i] !== bytes[i]) {
      return false;
    }
  }
  return true;
}

/** Helpers */
function printMIDIDevices() {
  const outputs = [];
  const inputs = [];

  for (let i = 0; i < input.getPortCount(); i++) {
    inputs.push(input.getPortName(i));
  }
  console.log('MIDI Inputs');
  console.log(inputs);

  for (let i = 0; i < output.getPortCount(); i++) {
    outputs.push(output.getPortName(i));
  }
  console.log('MIDI Outputs');
  console.log(outputs);
}

module.exports = {
  parseMIDIMessage,
  equals,
  printMIDIDevices,
  input,
  output,
};
