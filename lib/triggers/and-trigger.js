import { TriggerTypeClassMap } from '../utils/index.js';
import Trigger from './trigger.js';

class AndTrigger extends Trigger {
  test(msg) {
    let runningResult = true;

    if (this.params.triggers) {
      for (let index = 0; index < this.params.triggers.length; index += 1) {
        const trigger = this.params.triggers[index];
        if (trigger.enabled) {
          if (TriggerTypeClassMap[trigger.type] !== undefined) {
            const subTriggerResult = new TriggerTypeClassMap[trigger.type](trigger).test(msg);
            runningResult = runningResult && subTriggerResult;
            if (!runningResult) {
              // NOTE(jwetzell): short circuit and
              return runningResult;
            }
          }
        }
      }
    }
    return runningResult;
  }
}

export default AndTrigger;
