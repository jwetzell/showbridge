import { noop } from 'lodash-es';
import { resolveAllKeys } from '../utils/index.js';

class Transform {
  constructor(transformObj) {
    this.obj = transformObj;
  }

  // eslint-disable-next-line no-unused-vars
  transformFunction(msg, vars) {
    noop();
  }

  transform(msg, vars) {
    if (!this.enabled) {
      return;
    }

    this.transformFunction(msg, vars);
  }

  get type() {
    return this.obj.type;
  }

  get params() {
    return this.obj.params;
  }

  get enabled() {
    return this.obj.enabled;
  }

  resolveTemplatedParams(data) {
    return resolveAllKeys(this.params, data);
  }

  toJSON() {
    return {
      type: this.type,
      params: this.params,
      enabled: this.enabled,
    };
  }
}
export default Transform;
