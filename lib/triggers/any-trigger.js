import Trigger from './trigger.js';

/**
 * @memberof module:Triggers
 * @extends module:Triggers.Trigger
 */
class AnyTrigger extends Trigger {
  test(msg) {
    return msg !== undefined;
  }
}

export default AnyTrigger;
