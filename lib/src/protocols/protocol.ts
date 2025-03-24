import { ProtocolObj } from '@showbridge/types/dist/models/protocol.js';
import EventEmitter from 'node:events';
import Router from '../router.js';
import { Templating } from '../utils/index.js';

class Protocol<T extends Object> extends EventEmitter {
  router: Router;
  private obj: ProtocolObj<T>;

  constructor(protocolObj: ProtocolObj<T>, router: Router) {
    super();
    this.router = router;
    this.obj = protocolObj;
  }

  get params() {
    return this.obj.params;
  }

  resolveTemplatedParams(data) {
    return Templating.resolveAllKeys<T>(this.params, data);
  }

  toJSON() {
    return {
      params: this.params,
    };
  }
}
export default Protocol;
