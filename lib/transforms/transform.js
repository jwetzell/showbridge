import { noop } from 'lodash-es';
import { resolveAllKeys } from '../utils/index.js';

/**
 * @memberof module:Transforms
 */
class Transform {
  /**
   *
   * @typedef {object} TransformObj
   * @property {object} type
   * @property {object} propertys
   * @property {object} enabled
   * @property {object} comment
   *
   */

  /**
   * @param {TransformObj} transformObj
   */
  constructor(transformObj) {
    /** @type {TransformObj} */
    this.obj = transformObj;
  }

  /**
   * underlying function that does the actual transform, should be overridden when extended
   * @param {object} msg incoming msg to transform
   * @param {object} vars global vars to use in templating engine
   */
  // eslint-disable-next-line no-unused-vars
  transformFunction(msg, vars) {
    noop();
  }

  /**
   *
   * @param {object} msg incoming msg to transform
   * @param {object} vars global vars to use in templating engine
   * @returns {object} the transformed message
   */
  transform(msg, vars) {
    if (!this.enabled) {
      return;
    }

    this.transformFunction(msg, vars);
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
    return this.obj.enabled;
  }

  /**
   *
   * @param {object} data data to pass into templating engine
   * @returns {object} the params after running through templating engine
   */
  resolveTemplatedParams(data) {
    return resolveAllKeys(this.params, data);
  }

  /**
   *
   * @returns {object} plain object representation of this transform
   */
  toJSON() {
    // TODO(jwetzell): add comments here
    return {
      type: this.type,
      params: this.params,
      enabled: this.enabled,
    };
  }
}
export default Transform;
