import terminalKitPackage from 'terminal-kit';
const { terminal } = terminalKitPackage;

export function printMessage(msg, msgType) {
  let table = [];
  switch (msgType) {
    case 'osc':
      const address = msg.address;
      table = [['message', 'value'], [address]];
      msg.args.forEach((arg, index) => {
        table.push([index, arg.value]);
      });
      break;
    case 'midi':
      table = [['MIDI byte1', 'MIDI byte2', 'MIDI byte3'], msg];
      break;
  }
  terminal.table(table, {
    fit: true,
  });
}

export function printTriggers(triggers) {
  let table = [['type', 'params', 'actions', 'enabled']];
  triggers.forEach((trigger) => {
    table.push([trigger.type, JSON.stringify(trigger.params), JSON.stringify(trigger.actions), trigger.enabled]);
  });
  terminal.table(table);
}

export function printMIDIOutputs(outputs) {
  let table = [['Port Number', 'Device Name']];
  outputs.forEach((output, index) => {
    table.push([index, output]);
  });
  terminal.table(table, {
    fit: true,
  });
}

export function printMIDIInputs(inputs) {
  let table = [['Port Number', 'Device Name']];
  inputs.forEach((input, index) => {
    table.push([index, input]);
  });
  terminal.table(table, {
    fit: true,
  });
}
