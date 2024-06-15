import { Message } from '../messages/index.js';
import Trigger from './trigger.js';

type AnyTriggerParams = {};

class AnyTrigger extends Trigger<AnyTriggerParams> {
  test(msg: Message) {
    return msg !== undefined;
  }
}

export default AnyTrigger;
