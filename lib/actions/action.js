import { EventEmitter } from 'events';
import { cloneDeep, has, noop } from 'lodash-es';
import { TransformTypeClassMap, logger, resolveAllKeys } from '../utils/index.js';

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
        if (has(TransformTypeClassMap, transform.type)) {
          return new TransformTypeClassMap[transform.type](transform);
        }
        logger.error(`action: unhandled transform type = ${transform.type}`);
        return undefined;
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

  // eslint-disable-next-line no-unused-vars
  doFunction(msg, vars, protocols) {
    noop();
  }

  do(msg, vars, protocols) {
    if (!this.enabled) {
      this.emit('finished');
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
export default Action;
