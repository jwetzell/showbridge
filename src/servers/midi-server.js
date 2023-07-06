const events = require('events');
const midi = require('@julusian/midi');
const MIDIMessage = require('../models/message/midi-message');

class MIDIServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();

    this.virtualInput = new midi.Input();
    this.virtualOutput = new midi.Output();

    this.virtualInput.openVirtualPort('oscee Input');
    this.virtualOutput.openVirtualPort('oscee Output');

    this.virtualInput.on('message', (deltaTime, msg) => {
      try {
        const parsedMIDI = new MIDIMessage(msg);
        this.eventEmitter.emit('message', parsedMIDI, 'midi');
      } catch (error) {
        console.error('MIDI: problem processing MIDI message!');
        console.error(error);
      }
    });
  }

  reload(params) {
    //TODO(jwetzell): look into better way to reload inputs
    const inputMap = this.inputMap;

    //TODO(jwetzell): find a way to detect midi device changes
    if (params.hasOwnProperty('inputs')) {
      params.inputs.forEach((requestedMidiInput) => {
        const midiInput = new midi.Input();
        if (inputMap.hasOwnProperty(requestedMidiInput)) {
          if (typeof requestedMidiInput === 'number') {
            //midi input by index
            midiInput.openPort(requestedMidiInput);
            requestedMidiInput = inputMap[requestedMidiInput];
          } else {
            //midi input by name
            midiInput.openPort(inputMap[requestedMidiInput]);
          }
          console.log(`MIDI: setting up input - ${requestedMidiInput}`);
          midiInput.on('message', (deltaTime, msg) => {
            try {
              const parsedMIDI = new MIDIMessage(msg);
              this.eventEmitter.emit('message', parsedMIDI, 'midi');
            } catch (error) {
              console.error('MIDI: problem processing MIDI message!');
              console.error(error);
            }
          });
        } else {
          console.error(`MIDI: no midi device found with name - ${midiInputName}`);
        }
      });
    }
  }

  get inputMap() {
    const input = new midi.Input();
    const inputMap = {};

    for (let i = 0; i < input.getPortCount(); i++) {
      const midiInputName = input.getPortName(i);
      inputMap[midiInputName] = i;
      inputMap[i] = midiInputName;
    }
    return inputMap;
  }

  get outputMap() {
    const output = new midi.Output();
    const outputMap = {};

    for (let i = 0; i < output.getPortCount(); i++) {
      const midiInputName = output.getPortName(i);
      outputMap[midiInputName] = i;
      outputMap[i] = midiInputName;
    }
    return outputMap;
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }

  send(msg) {
    this.virtualOutput.sendMessage(msg);
  }
}

module.exports = MIDIServer;
