import terminalKitPackage from 'terminal-kit';
const { terminal } = terminalKitPackage;

export function printMessage(msg, msgType) {
  let table = [];
  switch (msgType) {
    case 'osc':
      const address = msg.address;
      table = [['message', 'value'], [address]];
      msg.args.forEach((arg, index) => {
        table.push([index, arg]);
      });
      break;
    case 'midi':
      switch (msg.status) {
        case 'note_on':
          table.push(['status', 'note', 'velocity']);
          table.push([msg.status, msg.note, msg.velocity]);
          break;
        case 'note_off':
          table.push(['status', 'note', 'velocity']);
          table.push([msg.status, msg.note, msg.velocity]);
          break;
        case 'polyphonic_aftertouch':
          table.push(['status', 'note', 'pressure']);
          table.push([msg.status, msg.note, msg.pressure]);
          break;
        case 'control_change':
          table.push(['status', 'control', 'value']);
          table.push([msg.status, msg.control, msg.value]);
          break;
        case 'program_change':
          table.push(['status', 'program']);
          table.push([msg.status, msg.program]);
          break;
        case 'channel_aftertouch':
          table.push(['status', 'pressure']);
          table.push([msg.status, msg.pressure]);
          break;
        case 'pitch_bend':
          table.push(['status', 'value']);
          table.push([msg.status, msg.value]);
          break;
      }
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
