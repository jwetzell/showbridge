import { RouterVars, TriggerObj } from '@showbridge/types';
import { has } from 'lodash-es';
import Action from '../actions/action.js';
import { ActionTypeClassMap } from '../actions/index.js';
import { Message } from '../messages/index.js';
import { Templating, disabled } from '../utils/index.js';
import { TriggerTypeClassMap } from './index.js';

class Trigger<T extends Object> {
  private obj: TriggerObj<T>;
  actions: Action<unknown>[];
  subTriggers: Trigger<unknown>[];

  constructor(triggerObj: TriggerObj<T>) {
    this.obj = triggerObj;

    this.actions = [];
    this.loadActions();

    this.subTriggers = [];
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
  test(msg: Message, vars: RouterVars) {
    return true;
  }

  shouldFire(msg: Message, vars: RouterVars) {
    if (!this.enabled) {
      return false;
    }
    return this.test(msg, vars);
  }

  get type() {
    return this.obj.type;
  }

  get params() {
    return this.obj.params;
  }

  get enabled() {
    return this.obj.enabled && !disabled.triggers.has(this.type);
  }

  get comment() {
    return this.obj.comment;
  }

  resolveTemplatedParams(data) {
    return Templating.resolveAllKeys<T>(this.params, data);
  }

  toJSON() {
    return {
      comment: this.comment,
      type: this.type,
      params: this.params,
      actions: this.actions.map((action) => action.toJSON()),
      subTriggers: this.subTriggers.map((trigger) => trigger.toJSON()),
      enabled: this.enabled,
    };
  }
}
export default Trigger;
