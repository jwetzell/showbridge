import { isEqual } from 'lodash-es';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class BytesEqualTrigger extends Trigger {
  test(msg) {
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
