import { EventEmitter } from 'events';
import { cloneDeep, has, noop } from 'lodash-es';
import { Templating, Types, disabled } from '../utils/index.js';

/**
 * @memberof module:Actions
 */
class Action extends EventEmitter {
  /**
   *
   * @typedef {object} ActionObj
   * @property {object} type
   * @property {object} params
   * @property {object} enabled
   * @property {object} comment
   *
   */

  /**
   * @param {ActionObj} actionObj
   */
  constructor(actionObj) {
    super();

    /** @type {ActionObj} */
    this.obj = actionObj;

    /** @type {module:Transforms.Transform[]} */
    this.transforms = [];
    this.loadTransforms();
  }

  loadTransforms() {
    if (this.obj.transforms) {
      // NOTE(jwetzell): turn transform JSON into class instances
      this.transforms = this.obj.transforms
        .filter((transform) => has(Types.TransformTypeClassMap, transform.type))
        .map((transform) => new Types.TransformTypeClassMap[transform.type](transform));
    }
  }

  resolveTemplatedParams(data) {
    return Templating.resolveAllKeys(this.params, data);
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
    return this.obj.enabled && !disabled.actions.has(this.type);
  }

  /**
   * @type {string}
   * @readonly
   */
  get comment() {
    return this.obj.comment;
  }

  getTransformedMessage(msg, vars) {
    // NOTE(jwetzell): short circuit if there is no transforms to do
    if (this.transforms.length === 0) {
      return msg;
    }

    // NOTE(jwetzell): we don't want to alter the original msg if we are going to transform
    const msgCopy = cloneDeep(msg);
    this.transforms.forEach((transform, transformIndex) => {
      transform.transform(msgCopy, vars);
      this.emit('transform', `transforms/${transformIndex}`, transform.enabled);
    });
    return msgCopy;
  }

  /**
   * underlying function that does the actual action, should be overridden when extended
   * @param {object} msg incoming msg to transform
   * @param {object} vars global vars to use in templating engine
   * @param {object} protocols router protocol map if the action needs access to a protocol
   */
  // eslint-disable-next-line no-unused-vars
  doFunction(msg, vars, protocols) {
    noop();
  }

  /**
   *
   * @param {object} msg incoming msg to transform
   * @param {object} vars global vars to use in templating engine
   * @param {object} protocols router protocol map if the action needs access to a protocol
   */
  do(msg, vars, protocols) {
    if (!this.enabled) {
      this.emit('finished');
      return;
    }
    this.doFunction(msg, vars, protocols);
  }

  /**
   *
   * @returns {object} plain object representation of this action
   */
  toJSON() {
    return {
      comment: this.comment,
      type: this.type,
      params: this.params,
      transforms: this.transforms,
      enabled: this.enabled,
    };
  }
}
export default Action;
