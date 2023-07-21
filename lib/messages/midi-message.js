const { has } = require('lodash');
const { logger } = require('../utils');

class MIDIMessage {
  constructor(bytes, port) {
    this.port = port;

    switch (bytes[0] >> 4) {
      case 0x8: // note off
        this.channel = (bytes[0] & 0xf) + 1;
        this.status = 'note_off';
        this.note = bytes[1];
        this.velocity = bytes[2];
        break;
      case 0x9: // note on
        this.channel = (bytes[0] & 0xf) + 1;
        this.status = 'note_on';
        this.note = bytes[1];
        this.velocity = bytes[2];
        break;
      case 0xa:
        this.channel = (bytes[0] & 0xf) + 1;
        this.status = 'polyphonic_aftertouch';
        this.note = bytes[1];
        this.pressure = bytes[2];
        break;
      case 0xb:
        this.channel = (bytes[0] & 0xf) + 1;
        this.status = 'control_change';
        this.control = bytes[1];
        this.value = bytes[2];
        break;
      case 0xc:
        this.channel = (bytes[0] & 0xf) + 1;
        this.status = 'program_change';
        this.program = bytes[1];
        break;
      case 0xd:
        this.channel = (bytes[0] & 0xf) + 1;
        this.status = 'channel_aftertouch';
        this.pressure = bytes[1];
        break;
      case 0xe:
        this.channel = (bytes[0] & 0xf) + 1;
        this.status = 'pitch_bend';
        this.value = bytes[1] + (bytes[2] << 7);
        break;
      case 0xf:
        // sysex
        switch (bytes[0] & 0xf) {
          case 0xa:
            this.status = 'start';
            break;
          case 0xb:
            this.status = 'continue';
            break;
          case 0xc:
            this.status = 'stop';
            break;
          case 0xf:
            this.status = 'reset';
            break;
          default:
            logger.error(`midi: unhandled sysex status = ${bytes[0]}`);
        }
        break;

      default:
        logger.error(`midi: unhandled status = ${bytes[0]}`);
    }
  }

  equals(bytes) {
    for (let i = 0; i < this.bytes.length; i += 1) {
      if (this.bytes[i] !== bytes[i]) {
        return false;
      }
    }
    return true;
  }

  get messageType() {
    return 'midi';
  }

  // TODO(jwetzell) it would be nice to update an instance bytes object as properties are updated
  // via getters/setters like other message types
  get bytes() {
    return MIDIMessage.objectToBytes(this);
  }

  toString() {
    return `status: ${this.status} ch: ${this.channel} data: ${this.bytes.slice(1).join(' ')}`;
  }

  static objectToBytes(obj) {
    const midiBytes = [];
    const midiStatusMap = {
      note_off: 0x8,
      note_on: 0x9,
      polyphonic_aftertouch: 0xa,
      control_change: 0xb,
      program_change: 0xc,
      channel_aftertouch: 0xd,
      pitch_bend: 0xe,
      start: 0xfa,
      continue: 0xfb,
      stop: 0xfc,
      reset: 0xff,
    };

    switch (obj.status) {
      case 'note_off':
        midiBytes[0] = (midiStatusMap[obj.status] << 4) ^ (obj.channel - 1);

        if (has(obj, 'note') && has(obj, 'velocity')) {
          midiBytes[1] = obj.note;
          midiBytes[2] = obj.velocity;
        } else {
          throw new Error('note_off must include both note and velocity params');
        }
        break;
      case 'note_on':
        midiBytes[0] = (midiStatusMap[obj.status] << 4) ^ (obj.channel - 1);

        if (has(obj, 'note') && has(obj, 'velocity')) {
          midiBytes[1] = obj.note;
          midiBytes[2] = obj.velocity;
        } else {
          throw new Error('note_on must include both note and velocity params');
        }
        break;
      case 'polyphonic_aftertouch':
        midiBytes[0] = (midiStatusMap[obj.status] << 4) ^ (obj.channel - 1);

        if (has(obj, 'note') && has(obj, 'pressure')) {
          midiBytes[1] = obj.note;
          midiBytes[2] = obj.pressure;
        } else {
          throw new Error('polyphonic_aftertouch must include both note and pressure params');
        }
        break;
      case 'control_change':
        midiBytes[0] = (midiStatusMap[obj.status] << 4) ^ (obj.channel - 1);

        if (has(obj, 'control') && has(obj, 'value')) {
          midiBytes[1] = obj.control;
          midiBytes[2] = obj.value;
        } else {
          throw new Error('control_change must include both control and value params');
        }
        break;
      case 'program_change':
        midiBytes[0] = (midiStatusMap[obj.status] << 4) ^ (obj.channel - 1);

        if (has(obj, 'program')) {
          midiBytes[1] = obj.program;
        } else {
          throw new Error('program_change must include program params');
        }
        break;
      case 'channel_aftertouch':
        midiBytes[0] = (midiStatusMap[obj.status] << 4) ^ (obj.channel - 1);

        if (has(obj, 'pressure')) {
          midiBytes[1] = obj.pressure;
        } else {
          throw new Error('channel_aftertouch must include pressure param');
        }
        break;
      case 'pitch_bend':
        midiBytes[0] = (midiStatusMap[obj.status] << 4) ^ (obj.channel - 1);

        if (has(obj, 'value') && obj.value <= 16383) {
          const lsb = obj.value & 0x7f;
          const msb = (obj.value >> 7) & 0x7f;

          midiBytes[1] = lsb;
          midiBytes[2] = msb;
        } else {
          throw new Error('pitch_bend must include value param and be less than or equal to 16383');
        }
        break;
      case 'start':
      case 'continue':
      case 'stop':
      case 'reset':
        midiBytes[0] = midiStatusMap[obj.status];
        break;
      default:
        logger.error(`midi: unhandled status = ${obj.status}`);
    }
    return midiBytes;
  }

  static parseActionParams(params) {
    if (params.bytes !== undefined) {
      return new MIDIMessage(params.bytes, 'virtual');
    }
    return new MIDIMessage(MIDIMessage.objectToBytes(params), 'virtual');
  }

  toJSON() {
    return {
      messageType: this.messageType,
      bytes: this.bytes,
      port: this.port,
    };
  }

  static fromJSON(json) {
    return new MIDIMessage(json.bytes, json.port);
  }
}
module.exports = MIDIMessage;
