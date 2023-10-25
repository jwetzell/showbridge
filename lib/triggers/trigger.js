import { has } from 'lodash-es';
import { ActionTypeClassMap, TriggerTypeClassMap, resolveAllKeys } from '../utils/index.js';

class Trigger {
  constructor(obj) {
    this.obj = obj;

    this.loadActions();
    this.loadSubTriggers();
  }

  loadActions() {
    if (this.obj.actions) {
      // NOTE(jwetzell): turn action JSON into class instances
      this.actions = this.obj.actions
        .filter((action) => has(ActionTypeClassMap, action.type))
        .map((action) => new ActionTypeClassMap[action.type](action));
    }
  }

  loadSubTriggers() {
    if (this.obj.subTriggers) {
      // NOTE(jwetzell): turn subTrigger JSON into class instances
      this.subTriggers = this.obj.subTriggers
        .filter((subTrigger) => has(TriggerTypeClassMap, subTrigger.type))
        .map((subTrigger) => new TriggerTypeClassMap[subTrigger.type](subTrigger));
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
