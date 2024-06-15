import { isEqual } from 'lodash-es';
import { MIDIMessage, MQTTMessage, OSCMessage, TCPMessage, UDPMessage, WebSocketMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

type BytesEqualTriggerParams = {
  bytes: number[];
};

class BytesEqualTrigger extends Trigger<BytesEqualTriggerParams> {
  test(msg: MIDIMessage | UDPMessage | OSCMessage | TCPMessage | MQTTMessage | WebSocketMessage) {
    if (msg.bytes === undefined) {
      logger.error('trigger: bytes equality check attempted on msg that does not have bytes');
      return false;
    }

    // NOTE(jwetzell): good we are looking at a message that has bytes
    const bytesToMatch = Uint8Array.from(this.params.bytes);
    return isEqual(msg.bytes, bytesToMatch);
  }
}

export default BytesEqualTrigger;
