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

    this.inputs = [];

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

  reload(params) {
    //TODO(jwetzell): look into better way to reload ports
    this.inputs.forEach((input) => input.closePort());
    this.inputs = [];

    //TODO(jwetzell): find a way to detect midi device changes
    for (let i = 0; i < this.input.getPortCount(); i++) {
      if (!this.input.getPortName(i).includes('oscee')) {
        const midiInput = new midi.Input();
        midiInput.openPort(i);
        midiInput.on('message', (deltaTime, msg) => {
          try {
            const parsedMIDI = new MIDIMessage(msg);
            this.eventEmitter.emit('message', parsedMIDI, 'midi');
          } catch (error) {
            console.error('PROBLEM PROCESSING MIDI MESSAGE');
            console.error(error);
          }
        });

        this.inputs.push(midiInput);
      }
    }
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }
}

module.exports = MIDIServer;
