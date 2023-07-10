const events = require('events');
const midi = require('@julusian/midi');
const MIDIMessage = require('../models/message/midi-message');
const { logger } = require('../utils/helper');

class MIDIServer {
  constructor() {
    this.eventEmitter = new events.EventEmitter();

    this.virtualInput = new midi.Input();
    this.virtualOutput = new midi.Output();

    this.virtualInput.openVirtualPort('oscee Input');
    this.virtualOutput.openVirtualPort('oscee Output');

    this.virtualInput.on('message', (deltaTime, msg) => {
      try {
        const midiMessage = new MIDIMessage(msg, 'virtual');
        this.eventEmitter.emit('message', midiMessage);
      } catch (error) {
        logger.error(`midi: problem processing MIDI message - ${error}`);
      }
    });

    this.inputs = [];
  }

  reload() {
    //TODO(jwetzell): look into better way to reload inputs
    //TODO(jwetzell): consider letting the user configure the inputs that are loaded
    this.inputs.forEach((input) => {
      if (input.isPortOpen()) {
        input.closePort();
      }
    });

    this.inputs = [];

    for (let index = 0; index < this.virtualInput.getPortCount(); index++) {
      if (!this.virtualInput.getPortName(index).includes('oscee')) {
        const input = new midi.Input();
        input.openPort(index);
        input.on('message', (deltaTime, msg) => {
          try {
            const midiMessage = new MIDIMessage(msg, this.virtualInput.getPortName(index));
            this.eventEmitter.emit('message', midiMessage);
          } catch (error) {
            logger.error(`midi: problem processing MIDI message - ${error}`);
          }
        });
      }
    }
    //TODO(jwetzell): find a way to detect midi device changes
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
