const { logger } = require('../utils/helper');
const Transform = require('./transform');
const _ = require('lodash');
class Action {
  constructor(actionObj) {
    this.type = actionObj.type;
    this.params = actionObj.params;
    this.enabled = actionObj.enabled;
    this.transforms = [];

    if (actionObj.transforms) {
      this.transforms = actionObj.transforms.map((transform) => new Transform(transform));
    }
  }

  getTransformedMessage(msg, vars) {
    if (this.transforms.length > 0) {
      const msgCopy = _.cloneDeep(msg);
      this.transforms.forEach((transform) => {
        transform.transform(msgCopy, vars);
      });
      return msgCopy;
    } else {
      return msg;
    }
  }
}
module.exports = Action;
