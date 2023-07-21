const { resolveAllKeys } = require('../utils');

class Transform {
  constructor(transformObj) {
    this.obj = transformObj;
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
module.exports = Transform;
