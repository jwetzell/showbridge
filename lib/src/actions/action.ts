import { cloneDeep, has, noop } from 'lodash-es';
import { EventEmitter } from 'node:events';
import { Message } from '../messages/index.js';
import { RouterProtocols, RouterVars } from '../router.js';
import { TransformTypeClassMap } from '../transforms/index.js';
import Transform, { TransformObj } from '../transforms/transform.js';
import { Templating, disabled } from '../utils/index.js';

export type ActionObj<T> = {
  type: string;
  params: T;
  transforms: TransformObj<unknown>[];
  enabled: boolean;
  comment: string;
};

class Action<T extends Object> extends EventEmitter {
  private obj: ActionObj<T>;
  transforms: Transform<unknown>[];

  constructor(actionObj: ActionObj<T>) {
    super();

    this.obj = actionObj;
    this.transforms = [];
    this.loadTransforms();
  }

  loadTransforms() {
    if (this.obj.transforms) {
      // NOTE(jwetzell): turn transform JSON into class instances
      this.transforms = this.obj.transforms
        .filter((transform) => has(TransformTypeClassMap, transform.type))
        .map((transform) => new TransformTypeClassMap[transform.type](transform));
    }
  }

  resolveTemplatedParams(data): T {
    return Templating.resolveAllKeys<T>(this.params, data);
  }

  get type() {
    return this.obj.type;
  }

  get params(): T {
    return this.obj.params;
  }

  get enabled() {
    return this.obj.enabled && !disabled.actions.has(this.type);
  }

  get comment() {
    return this.obj.comment;
  }

  getTransformedMessage<T extends Message>(msg: T, vars: RouterVars) {
    // NOTE(jwetzell): short circuit if there is no transforms to do
    if (this.transforms.length === 0) {
      return msg;
    }

    // NOTE(jwetzell): we don't want to alter the original msg if we are going to transform
    const msgCopy = cloneDeep(msg);
    this.transforms.forEach((transform, transformIndex) => {
      transform.transform(msgCopy, vars);
      this.emit('transform', `transforms/${transformIndex}`, transform.enabled);
    });
    return msgCopy;
  }

  // eslint-disable-next-line no-underscore-dangle, no-unused-vars
  _run(msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    noop();
  }

  run(msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    if (!this.enabled) {
      this.emit('finished');
      return;
    }
    this._run(msg, vars, protocols);
  }

  toJSON() {
    return {
      comment: this.comment,
      type: this.type,
      params: this.params,
      transforms: this.transforms.map((transform) => transform.toJSON()),
      enabled: this.enabled,
    };
  }
}
export default Action;
