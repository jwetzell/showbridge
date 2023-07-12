/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const _ = require('lodash');
const { logger } = require('../utils/helper');

class Action {
  constructor(actionObj) {
    this.obj = actionObj;

    this.transforms = [];
    this.loadTransforms();
  }

  loadTransforms() {
    if (this.obj.transforms) {
      this.transforms = this.obj.transforms.map((transform) => {
        try {
          // TODO(jwetzell): find a better way to dynamically load these classes
          const TransformClass = require(`../transforms/${transform.type}-transform`);
          return new TransformClass(transform);
        } catch (error) {
          logger.error(`action: unhandled transform type = ${transform.type}`);
          return undefined;
        }
      });
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
        if (transform.enabled) {
          transform.transform(msgCopy, vars);
        } else {
          logger.debug(`transform: ${this.type} is disabled skipping...`);
        }
      });
      return msgCopy;
    }
    return msg;
  }
}
module.exports = Action;
