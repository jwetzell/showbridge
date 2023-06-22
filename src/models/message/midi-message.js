class MIDIMessage {
  constructor(bytes) {
    this.channel = bytes[0] & 0xf;
    this.bytes = bytes;

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
}
module.exports = MIDIMessage;
