function printMessage(msg, msgType) {
  console.log(msg);
}

function printTriggers(triggers) {
  console.log(triggers);
}

function printMIDIOutputs(outputs) {
  console.log(outputs);
}

function printMIDIInputs(inputs) {
  console.log(inputs);
}

module.exports = {
  printMIDIInputs,
  printMIDIOutputs,
  printMessage,
  printTriggers,
};
