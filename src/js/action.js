const _ = require('lodash');
const Transform = require('./transform');

class Action {
  constructor(actionObj) {
    this.obj = actionObj;

    this.transforms = [];

    if (this.obj.transforms) {
      this.transforms = this.obj.transforms.map((transform) => new Transform(transform));
    }
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

  getTransformedMessage(msg, vars) {
    if (this.transforms.length > 0) {
      const msgCopy = _.cloneDeep(msg);
      this.transforms.forEach((transform) => {
        transform.transform(msgCopy, vars);
      });
      return msgCopy;
    }
    return msg;
  }
}
module.exports = Action;
