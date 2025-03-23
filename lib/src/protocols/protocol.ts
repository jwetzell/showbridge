import { ProtocolObj } from '@showbridge/types/dist/models/protocol.js';
import EventEmitter from 'node:events';
import Router from '../router.js';
import { disabled, Templating } from '../utils/index.js';

class Protocol<T extends Object> extends EventEmitter {
  router: Router;
  private obj: ProtocolObj<T>;

  constructor(protocolObj: ProtocolObj<T>, router: Router) {
    super();
    this.router = router;
    this.obj = protocolObj;
  }

  get type() {
    return this.obj.type;
  }

  get params() {
    return this.obj.params;
  }

  get enabled() {
    return this.obj.enabled && !disabled.protocols.has(this.type);
  }

  get comment() {
    return this.obj.comment;
  }
  get status() {
    return {};
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
export default Protocol;
