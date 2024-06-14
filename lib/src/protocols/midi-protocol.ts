import { Router } from 'express';
import { EventEmitter } from 'node:events';
import { MIDIMessage } from '../messages/index.js';
import { disabled, logger } from '../utils/index.js';

import { Input, Output } from '@julusian/midi';

type MIDIOutput = {
  name: string;
  index: number;
  output: Output;
};

class MIDIProtocol extends EventEmitter {
  router: Router;
  inputs: Input[];
  outputs: MIDIOutput[];

  virtualInputName: string;
  virtualOutputName: string;

  virtualInput: Input;
  virtualOutput: Output;

  stopped: boolean;

  constructor(router) {
    super();
    this.router = router;

    this.inputs = [];
    this.outputs = [];
  }

  reload(params) {
    // if (midi === undefined) {
    //   logger.error('midi: midi library not loaded skipping reload');
    //   this.emit('started');
    //   return;
    // }
    if (this.virtualInput) {
      this.virtualInput.destroy();
      delete this.virtualInput;
    }

    if (this.virtualOutput) {
      this.virtualOutput.destroy();
      delete this.virtualInput;
    }

    this.virtualInput = new Input();
    this.virtualOutput = new Output();

    this.virtualInputName = `showbridge Input`;
    this.virtualOutputName = `showbridge Output`;

    if (params?.virtualInputName) {
      this.virtualInputName = params.virtualInputName;
    }
    this.virtualInput.openVirtualPort(this.virtualInputName);

    this.virtualInput.ignoreTypes(false, false, false);

    if (params?.virtualOutputName) {
      this.virtualOutputName = params.virtualOutputName;
    }
    this.virtualOutput.openVirtualPort(this.virtualOutputName);

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
      const input = new Input();
      this.inputs.push(input);
      input.openPort(index);
      input.ignoreTypes(false, false, false);

      input.on('message', (deltaTime, msg) => {
        try {
          const midiMessage = new MIDIMessage(msg, this.#getPortName(input, index));
          this.emit('messageIn', midiMessage);
        } catch (error) {
          logger.error(`midi: problem processing MIDI message - ${error}`);
        }
      });
    }

    this.outputs.forEach((output) => {
      if (output.output.isPortOpen()) {
        output.output.destroy();
      }
    });

    this.outputs = [];

    for (let index = 0; index < this.virtualOutput.getPortCount(); index += 1) {
      const output = new Output();
      const outputName = this.#getPortName(output, index);
      this.outputs.push({
        name: outputName,
        index,
        output,
      });
    }
    this.emit('started');
    // TODO(jwetzell): find a way to detect midi device changes
  }

  #getPortName(port, index) {
    if (process.platform === 'linux') {
      const rawPortName = port.getPortName(index);
      const parts = rawPortName.match(/^(.*):(.*)\s+(\d+:\d+)$/);
      if (parts) {
        return parts[2];
      }
      return rawPortName;
    }
    return port.getPortName(index);
  }

  send(bytes: number[], port: string) {
    const output = port === undefined ? this.virtualOutput : this.#findMidiOutput(port);
    if (output === undefined) {
      logger.error(`midi: no midi device found with name ${port}`);
      return;
    }
    try {
      output.sendMessage(bytes);
    } catch (error) {
      logger.error('midi: problem sending midi');
      logger.error(error);
    }
  }

  stop() {
    this.stopped = true;
    this.inputs.forEach((input) => {
      input.destroy();
    });

    this.outputs.forEach((output) => {
      output.output.destroy();
    });

    if (this.virtualInput) {
      this.virtualInput.destroy();
    }

    if (this.virtualOutput) {
      this.virtualOutput.destroy();
    }
    this.emit('stopped');
  }

  #findMidiOutput(port) {
    const foundOutput = this.outputs.find((output) => output.name === port);
    if (foundOutput !== undefined && foundOutput.output !== undefined) {
      if (!foundOutput.output.isPortOpen()) {
        foundOutput.output.openPort(foundOutput.index);
      }
      return foundOutput.output;
    }
    return undefined;
  }

  get status() {
    const devices = [];
    try {
      this.inputs.forEach((port, index) => {
        if (!this.stopped && port.isPortOpen()) {
          devices.push({
            type: 'input',
            name: this.#getPortName(port, index),
          });
        }
      });

      this.outputs.forEach((output) => {
        devices.push({
          type: 'output',
          name: output.name,
        });
      });
    } catch (error) {
      logger.error('midi: problem assembling midi status');
      logger.error(error);
    }

    return {
      enabled: !disabled.protocols.has('midi'), // && midi !== undefined,
      devices,
    };
  }
}

export default MIDIProtocol;
