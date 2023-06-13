export function parseMIDIMessage(bytes) {
  const parsedMsg = {
    channel: bytes[0] & 0xf,
    bytes: bytes,
  };

  switch (bytes[0] >> 4) {
    case 8: //note off
      parsedMsg.status = 'note_off';
      parsedMsg.note = bytes[1];
      parsedMsg.velocity = bytes[2];
      break;
    case 9: //note on
      parsedMsg.status = 'note_on';
      parsedMsg.note = bytes[1];
      parsedMsg.velocity = bytes[2];
      break;
    case 10:
      parsedMsg.status = 'polyphonic_aftertouch';
      parsedMsg.note = bytes[1];
      parsedMsg.pressure = bytes[2];
      break;
    case 11:
      parsedMsg.status = 'control_change';
      parsedMsg.control = bytes[1];
      parsedMsg.value = bytes[2];
      break;
    case 12:
      parsedMsg.status = 'program_change';
      parsedMsg.program = bytes[1];
      break;
    case 13:
      parsedMsg.status = 'channel_aftertouch';
      parsedMsg.pressure = bytes[1];
      break;
    case 14:
      parsedMsg.status = 'pitch_bend';
      parsedMsg.value = bytes[1] + (bytes[2] << 7);
      break;
    default:
      console.log('unhandled midi status: ' + status);
  }
  return parsedMsg;
}

export function equals(msg, bytes) {
  for (let i = 0; i < msg.bytes.length; i++) {
    if (msg.bytes[i] !== bytes[i]) {
      return false;
    }
  }
  return true;
}
