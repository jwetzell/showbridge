const { EventEmitter } = require('events');
const { noop, cloneDeep } = require('lodash');
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
    const msgCopy = cloneDeep(msg);
    if (this.transforms.length > 0) {
      this.transforms.forEach((transform, transformIndex) => {
        transform.transform(msgCopy, vars);
        this.emit('transform', transform.toJSON(), `transforms/${transformIndex}`, transform.enabled);
      });
    }
    return msgCopy;
  }

  doFunction(msg, vars, protocols) {
    noop();
  }

  do(msg, vars, protocols) {
    if (!this.enabled) {
      return;
    }
    this.doFunction(msg, vars, protocols);
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
