const midi = require('midi');

const output = new midi.Output();
output.openVirtualPort('oscee Output');

const input = new midi.Input();
input.openVirtualPort('oscee Input');

printMIDIDevices();

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
  printMIDIDevices,
  input,
  output,
};
