const events = require('events');
const midi = require('@julusian/midi');
const MIDIMessage = require('../models/message/midi-message');

class MIDIServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();
    this.input = new midi.Input();
    this.output = new midi.Output();
    this.input.openVirtualPort('oscee Input');
    this.output.openVirtualPort('oscee Output');

    this.input.on('message', (deltaTime, msg) => {
      try {
        const parsedMIDI = new MIDIMessage(msg);
        this.eventEmitter.emit('message', parsedMIDI, 'midi');
      } catch (error) {
        console.error('PROBLEM PROCESSING MIDI MESSAGE');
        console.error(error);
      }
    });
  }

  reload() {
    const inputs = [];

    for (let i = 0; i < this.input.getPortCount(); i++) {
      inputs.push(this.input.getPortName(i));
    }
    console.debug('MIDI Inputs');
    inputs.forEach((input, i) => {
      console.debug(`${i}: ${input}`);
    });

    const outputs = [];
    for (let i = 0; i < this.output.getPortCount(); i++) {
      outputs.push(this.output.getPortName(i));
    }
    console.debug('MIDI Outputs');
    outputs.forEach((output, i) => {
      console.debug(`${i}: ${output}`);
    });
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = MIDIServer;
