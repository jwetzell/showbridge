import { has } from 'lodash-es';
import { EventEmitter } from 'node:events';
import Router from '../router.js';
import { TriggerTypeClassMap } from '../triggers/index.js';
import Trigger from '../triggers/trigger.js';

class Protocol<T extends Object> extends EventEmitter {
  private obj: any;
  router: Router;
  triggers: Trigger<unknown>[];

  constructor(router, protocolObj) {
    super();
    this.obj = protocolObj;
    this.router = router;
    this.triggers = [];
    this.loadTriggers();
  }

  loadTriggers() {
    if (this.obj.triggers) {
      // NOTE(jwetzell): turn trigger JSON into class instances
      this.triggers = this.obj.triggers
        .filter((transform) => has(TriggerTypeClassMap, transform.type))
        .map((transform) => new TriggerTypeClassMap[transform.type](transform));
    }
  }

  // get type() {
  //   return this.obj.type;
  // }

  get params(): T {
    return this.obj.params;
  }

  // get enabled() {
  //   return this.obj.enabled && !disabled.actions.has(this.type);
  // }

  // get comment() {
  //   return this.obj.comment;
  // }

  // NOTE(jwetzell): the following will be overridden
  // TODO(jwetzell): make this an abstract class
  // reload(params) {}

  // send() {}

  // stop() {}

  // get status() {
  //   return {};
  // }
}

export default Protocol;
