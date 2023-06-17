const midi = require('midi');

const output = new midi.Output();
output.openVirtualPort('oscee Output');

const input = new midi.Input();
input.openVirtualPort('oscee Input');

module.exports = {
  input,
  output,
};
