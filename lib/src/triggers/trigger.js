import { has } from 'lodash-es';
import { Templating, Types, disabled } from '../utils/index.js';

/**
 * @memberof module:Triggers
 */
class Trigger {
  /**
   *
   * @typedef {object} TriggerObj
   * @property {object} type
   * @property {object} params
   * @property {object} enabled
   * @property {object} comment
   *
   */

  /**
   * @param {TriggerObj} triggerObj
   */
  constructor(triggerObj) {
    /** @type {TriggerObj} */
    this.obj = triggerObj;

    this.loadActions();
    this.loadSubTriggers();
  }

  loadActions() {
    if (this.obj.actions) {
      // NOTE(jwetzell): turn action JSON into class instances
      /** @type {module:Actions.Action[]} */
      this.actions = this.obj.actions
        .filter((action) => has(Types.ActionTypeClassMap, action.type))
        .map((action) => new Types.ActionTypeClassMap[action.type](action));
    }
  }

  loadSubTriggers() {
    if (this.obj.subTriggers) {
      // NOTE(jwetzell): turn subTrigger JSON into class instances
      /** @type {module:Triggers.Trigger[]} */
      this.subTriggers = this.obj.subTriggers
        .filter((subTrigger) => has(Types.TriggerTypeClassMap, subTrigger.type))
        .map((subTrigger) => new Types.TriggerTypeClassMap[subTrigger.type](subTrigger));
    }
  }

  /**
   * underlying function that takes a msg and returns a boolean, should be overridden when extended
   * @param {object} msg
   * @returns {boolean} whether this trigger was well triggered by the msg
   */
  // eslint-disable-next-line no-unused-vars
  test(msg) {
    return true;
  }

  /**
   *
   * @param {object} msg
   * @returns {boolean} whether this trigger was well triggered by the msg
   */
  shouldFire(msg) {
    if (!this.enabled) {
      return false;
    }
    return this.test(msg);
  }

  /**
   * @type {string}
   * @readonly
   */
  get type() {
    return this.obj.type;
  }

  /**
   * @type {object}
   * @readonly
   */
  get params() {
    return this.obj.params;
  }

  /**
   * @type {boolean}
   * @readonly
   */
  get enabled() {
    return this.obj.enabled && !disabled.triggers.has(this.type);
  }

  /**
   * @type {string}
   * @readonly
   */
  get comment() {
    return this.obj.comment;
  }

  resolveTemplatedParams(data) {
    return Templating.resolveAllKeys(this.params, data);
  }

  /**
   *
   * @returns {object} plain object representation of this trigger
   */
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
