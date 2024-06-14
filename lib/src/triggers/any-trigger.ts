import { Message } from '../messages/index.js';
import Trigger from './trigger.js';

class AnyTrigger extends Trigger {
  test(msg: Message) {
    return msg !== undefined;
  }
}

export default AnyTrigger;
