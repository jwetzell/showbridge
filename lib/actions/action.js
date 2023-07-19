const _ = require('lodash');
const { logger, resolveAllKeys } = require('../utils/helper');
const FloorTransform = require('../transforms/floor-transform');
const LogTransform = require('../transforms/log-transform');
const MapTransform = require('../transforms/map-transform');
const PowerTransform = require('../transforms/power-transform');
const RoundTransform = require('../transforms/round-transform');
const ScaleTransform = require('../transforms/scale-transform');
const TemplateTransform = require('../transforms/template-transform');

class Action {
  constructor(actionObj) {
    this.obj = actionObj;

    this.transforms = [];
    this.loadTransforms();
  }

  loadTransforms() {
    if (this.obj.transforms) {
      this.transforms = this.obj.transforms.map((transform) => {
        // TODO(jwetzell): find a better way to dynamically load these classes
        switch (transform.type) {
          case 'floor':
            return new FloorTransform(transform);
          case 'log':
            return new LogTransform(transform);
          case 'map':
            return new MapTransform(transform);
          case 'power':
            return new PowerTransform(transform);
          case 'round':
            return new RoundTransform(transform);
          case 'scale':
            return new ScaleTransform(transform);
          case 'template':
            return new TemplateTransform(transform);
          default:
            logger.error(`action: unhandled transform type = ${transform.type}`);
            return undefined;
        }
      });
    }
  }

  resolveTemplatedParams(data) {
    return resolveAllKeys(this.params, data);
  }

  get type() {
    return this.obj.type;
  }

  get params() {
    return this.obj.params ? this.obj.params : {};
  }

  get enabled() {
    return this.obj.enabled;
  }

  get comment() {
    return this.obj.comment;
  }

  getTransformedMessage(msg, vars) {
    if (this.transforms.length > 0) {
      const msgCopy = _.cloneDeep(msg);
      this.transforms.forEach((transform) => {
        if (!transform.enabled) {
          logger.debug(`transform: ${this.type} is disabled skipping...`);
          return;
        }

        transform.transform(msgCopy, vars);
      });
      return msgCopy;
    }
    return msg;
  }

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
module.exports = Action;
