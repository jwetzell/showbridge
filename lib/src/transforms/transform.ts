import { RouterVars, TransformObj } from '@showbridge/types';
import { noop } from 'lodash-es';
import { Message } from '../messages/index.js';
import { disabled, Templating } from '../utils/index.js';

class Transform<T extends Object> {
  private obj: TransformObj<T>;

  constructor(transformObj: TransformObj<T>) {
    this.obj = transformObj;
  }

  // eslint-disable-next-line no-underscore-dangle, no-unused-vars
  _transform(msg: Message, vars: RouterVars) {
    noop();
  }

  transform(msg: Message, vars: RouterVars) {
    if (!this.enabled) {
      return;
    }

    this._transform(msg, vars);
  }

  get type() {
    return this.obj.type;
  }

  get params() {
    return this.obj.params;
  }

  get enabled() {
    return this.obj.enabled && !disabled.transforms.has(this.type);
  }

  get comment() {
    return this.obj.comment;
  }

  resolveTemplatedParams(data) {
    return Templating.resolveAllKeys<T>(this.params, data);
  }

  toJSON() {
    return {
      type: this.type,
      params: this.params,
      enabled: this.enabled,
      comment: this.comment,
    };
  }
}
export default Transform;
