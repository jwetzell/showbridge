import _ from 'lodash-es';
import Trigger from './trigger.js';
import { logger } from '../utils/index.js';

class BytesEqualTrigger extends Trigger {
  test(msg) {
    if (msg.bytes === undefined) {
      logger.error('trigger: bytes equality check attempted on msg that does not have bytes');
      return false;
    }

    // NOTE(jwetzell): good we are looking at a message that has bytes
    const bytesToMatch = Uint8Array.from(this.params.bytes);
    return _.isEqual(msg.bytes, bytesToMatch);
  }
}

export default BytesEqualTrigger;
