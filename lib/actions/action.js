const _ = require('lodash');
const { EventEmitter } = require('events');
const { logger, resolveAllKeys } = require('../utils');
const {
  FloorTransform,
  LogTransform,
  MapTransform,
  PowerTransform,
  RoundTransform,
  ScaleTransform,
  TemplateTransform,
} = require('../transforms');

class Action extends EventEmitter {
  constructor(actionObj) {
    super();
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
    return this.obj.params;
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
      this.transforms.forEach((transform, transformIndex) => {
        if (!transform.enabled) {
          logger.debug(`transform: ${transform.type} is disabled skipping...`);
          this.emit('transform', this, transformIndex, false);
          return;
        }

        transform.transform(msgCopy, vars);
        this.emit('transform', this, transformIndex, true);
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
