import { has } from 'lodash-es';
import { TypeClassMap, logger, resolveAllKeys } from '../utils/index.js';

class Trigger {
  constructor(obj) {
    this.obj = obj;

    this.loadActions();
  }

  loadActions() {
    if (this.obj.actions) {
      this.actions = this.obj.actions.map((action) => {
        if (has(TypeClassMap, action.type)) {
          return new TypeClassMap[action.type](action);
        }

        logger.error(`action: unhandled action type = ${action.type}`);
        return undefined;
      });
    }
  }

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
      enabled: this.enabled,
    };
  }
}
export default Trigger;
