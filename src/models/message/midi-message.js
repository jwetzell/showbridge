class MIDIMessage {
  constructor(bytes) {
    this.channel = (bytes[0] & 0xf) + 1;
    this.bytes = Uint8Array.from(bytes);

    switch (bytes[0] >> 4) {
      case 8: //note off
        this.status = 'note_off';
        this.note = bytes[1];
        this.velocity = bytes[2];
        break;
      case 9: //note on
        this.status = 'note_on';
        this.note = bytes[1];
        this.velocity = bytes[2];
        break;
      case 10:
        this.status = 'polyphonic_aftertouch';
        this.note = bytes[1];
        this.pressure = bytes[2];
        break;
      case 11:
        this.status = 'control_change';
        this.control = bytes[1];
        this.value = bytes[2];
        break;
      case 12:
        this.status = 'program_change';
        this.program = bytes[1];
        break;
      case 13:
        this.status = 'channel_aftertouch';
        this.pressure = bytes[1];
        break;
      case 14:
        this.status = 'pitch_bend';
        this.value = bytes[1] + (bytes[2] << 7);
        break;
      default:
        console.log('unhandled midi status: ' + status);
    }
  }

  equals(bytes) {
    for (let i = 0; i < this.bytes.length; i++) {
      if (this.bytes[i] !== bytes[i]) {
        return false;
      }
    }
    return true;
  }

  toString() {
    return `status: ${this.status} ch: ${this.channel} data: ${this.bytes.slice(1).join(' ')}`;
  }

  static parseActionParams(params) {
    //TODO(jwetzell): throw errors when parsing goes wrong
    if (params.bytes) {
      return new MIDIMessage(params.bytes);
    } else {
      const midiBytes = [];
      const midiStatusMap = {
        note_off: 8,
        note_on: 9,
        polyphonic_aftertouch: 10,
        control_change: 11,
        program_change: 12,
        channel_aftertouch: 13,
        pitch_bend: 14,
      };

      midiBytes[0] = (midiStatusMap[params.status] << 4) ^ (params.channel - 1);
      switch (params.status) {
        case 'note_off':
          if (params.note && params.velocity) {
            midiBytes[1] = params.note;
            midiBytes[2] = params.velocity;
          } else {
            throw new Error('note_off must include both note and velocity params');
          }
          break;
        case 'note_on':
          if (params.note && params.velocity) {
            midiBytes[1] = params.note;
            midiBytes[2] = params.velocity;
          } else {
            throw new Error('note_on must include both note and velocity params');
          }
          break;
        case 'polyphonic_aftertouch':
          if (params.note && params.pressure) {
            midiBytes[1] = params.note;
            midiBytes[2] = params.pressure;
          } else {
            throw new Error('polyphonic_aftertouch must include both note and pressure params');
          }
          break;
        case 'control_change':
          if (params.control && params.value) {
            midiBytes[1] = params.control;
            midiBytes[2] = params.value;
          } else {
            throw new Error('control_change must include both control and value params');
          }
          break;
        case 'program_change':
          if (params.program) {
            midiBytes[1] = params.program;
          } else {
            throw new Error('program_change must include program params');
          }
          break;
        case 'channel_aftertouch':
          if (params.pressure) {
            midiBytes[1] = params.pressure;
          } else {
            throw new Error('channel_aftertouch must include pressure param');
          }
          break;
        case 'pitch_bend':
          if (params.value && params.value <= 16383) {
            const lsb = params.value & 0x7f;
            const msb = (params.value >> 7) & 0x7f;

            midiBytes[1] = lsb;
            midiBytes[2] = msb;
          } else {
            throw new Error('pitch_bend must include value param and be less than or equal to 16383');
          }
          break;
        default:
          console.error(`unhandled midi status: ${params.status}`);
      }
      return new MIDIMessage(midiBytes);
    }
  }
}
module.exports = MIDIMessage;
