import Trigger from './trigger.js';

class AnyTrigger extends Trigger {
  test(msg) {
    return msg !== undefined;
  }
}

export default AnyTrigger;
