import { SenderTriggerParams } from '@showbridge/types';
import { has } from 'lodash-es';
import { HTTPMessage, TCPMessage, UDPMessage, WebSocketMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class SenderTrigger extends Trigger<SenderTriggerParams> {
  test(msg: HTTPMessage | TCPMessage | UDPMessage | WebSocketMessage) {
    if (!has(msg, 'sender')) {
      logger.error('trigger: host trigger attempted on message type that does not have host information');
      return false;
    }

    if (has(this.params, 'address')) {
      return msg.sender.address === this.params.address;
    }

    // NOTE(jwetzell): default to a no match
    return false;
  }
}

export default SenderTrigger;
