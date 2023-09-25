import { EventEmitter } from 'events';
import { MIDIMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';

let midi;
try {
  midi = await import('@julusian/midi');
} catch (error) {
  logger.error('midi: problem importing midi library');
  logger.error(error);
}

class MIDIProtocol extends EventEmitter {
  constructor() {
    super();
    this.inputs = [];
  }

  reload(params) {
    if (midi === undefined) {
      logger.error('midi: midi library not loaded skipping reload');
      return;
    }
    if (this.virtualInput) {
      this.virtualInput.destroy();
    }

    if (this.virtualOutput) {
      this.virtualOutput.destroy();
    }

    this.virtualInput = new midi.Input();
    this.virtualOutput = new midi.Output();

    let virtualInputName = `showbridge Input`;
    let virtualOutputName = `showbridge Output`;

    if (params?.virtualInputName) {
      virtualInputName = params.virtualInputName;
    }
    this.virtualInput.openVirtualPort(virtualInputName);

    if (params?.virtualOutputName) {
      virtualOutputName = params.virtualOutputName;
    }
    this.virtualOutput.openVirtualPort(virtualOutputName);

    this.virtualInput.on('message', (deltaTime, msg) => {
      try {
        const midiMessage = new MIDIMessage(msg, 'virtual');
        this.emit('messageIn', midiMessage);
      } catch (error) {
        logger.error(`midi: problem processing MIDI message - ${error}`);
      }
    });

    // TODO(jwetzell): look into better way to reload inputs
    // TODO(jwetzell): consider letting the user configure the inputs that are loaded
    this.inputs.forEach((input) => {
      if (input.isPortOpen()) {
        input.destroy();
      }
    });

    this.inputs = [];

    for (let index = 0; index < this.virtualInput.getPortCount(); index += 1) {
      if (!this.virtualInput.getPortName(index).includes(virtualInputName)) {
        const input = new midi.Input();
        this.inputs.push(input);
        input.openPort(index);
        input.on('message', (deltaTime, msg) => {
          try {
            const midiMessage = new MIDIMessage(msg, this.virtualInput.getPortName(index));
            this.emit('messageIn', midiMessage);
          } catch (error) {
            logger.error(`midi: problem processing MIDI message - ${error}`);
          }
        });
      }
    }
    // TODO(jwetzell): find a way to detect midi device changes
  }

  send(bytes) {
    this.virtualOutput.sendMessage(bytes);
    this.emit('messageOut', { bytes });
  }

  stop() {
    this.inputs.forEach((input) => {
      input.destroy();
    });

    if (this.virtualInput) {
      this.virtualInput.destroy();
    }

    if (this.virtualOutput) {
      this.virtualOutput.destroy();
    }
    this.emit('stopped');
  }

  get outputMap() {
    const output = new midi.Output();
    const outputMap = {};

    for (let i = 0; i < output.getPortCount(); i += 1) {
      const midiInputName = output.getPortName(i);
      outputMap[midiInputName] = i;
      outputMap[i] = midiInputName;
    }
    return outputMap;
  }

  // TODO(jwetzell): fill this out
  get status() {
    return {};
  }
}

export default MIDIProtocol;
