import { TriggerTypeClassMap } from '../utils/index.js';
import Trigger from './trigger.js';

class OrTrigger extends Trigger {
  test(msg) {
    let runningResult = false;

    if (this.params.triggers) {
      for (let index = 0; index < this.params.triggers.length; index += 1) {
        const trigger = this.params.triggers[index];
        if (trigger.enabled) {
          if (TriggerTypeClassMap[trigger.type] !== undefined) {
            const subTriggerResult = new TriggerTypeClassMap[trigger.type](trigger).test(msg);
            runningResult = runningResult || subTriggerResult;
          }
        }
      }
    }
    return runningResult;
  }
}

export default OrTrigger;
