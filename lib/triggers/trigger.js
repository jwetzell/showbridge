import { has } from 'lodash-es';
import { ActionTypeClassMap, TriggerTypeClassMap, logger, resolveAllKeys } from '../utils/index.js';

class Trigger {
  constructor(obj) {
    this.obj = obj;

    this.loadActions();
    this.loadSubTriggers();
  }

  loadActions() {
    if (this.obj.actions) {
      this.actions = this.obj.actions.map((action) => {
        if (has(ActionTypeClassMap, action.type)) {
          return new ActionTypeClassMap[action.type](action);
        }

        logger.error(`trigger: unhandled action type = ${action.type}`);
        return undefined;
      });
    }
  }

  loadSubTriggers() {
    if (this.obj.subTriggers) {
      this.subTriggers = this.obj.subTriggers.map((subTrigger) => {
        if (has(TriggerTypeClassMap, subTrigger.type)) {
          return new TriggerTypeClassMap[subTrigger.type](subTrigger);
        }
        logger.error(`trigger: unhandled subTrigger type = ${subTrigger.type}`);
        return undefined;
      });
    }
  }

  // eslint-disable-next-line no-unused-vars
  test(msg) {
    return true;
  }

  shouldFire(msg) {
    if (!this.enabled) {
      return false;
    }
    return this.test(msg);
  }

  get params() {
    return this.obj.params;
  }

  get type() {
    return this.obj.type;
  }

  get enabled() {
    return this.obj.enabled;
  }

  get comment() {
    return this.obj.comment;
  }

  resolveTemplatedParams(data) {
    return resolveAllKeys(this.params, data);
  }

  toJSON() {
    return {
      comment: this.comment,
      type: this.type,
      params: this.params,
      actions: this.actions,
      subTriggers: this.subTriggers,
      enabled: this.enabled,
    };
  }
}
export default Trigger;
