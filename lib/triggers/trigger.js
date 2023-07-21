const { logger, resolveAllKeys } = require('../utils');
const {
  DelayAction,
  ForwardAction,
  HttpAction,
  LogAction,
  MIDIOutputAction,
  MQTTOutputAction,
  OSCOutputAction,
  ShellAction,
  StoreAction,
  TCPOutputAction,
  UDPOutputAction,
  CloudOutputAction,
} = require('../actions');

class Trigger {
  constructor(obj) {
    this.obj = obj;

    this.loadActions();
  }

  loadActions() {
    if (this.obj.actions) {
      this.actions = this.obj.actions.map((action) => {
        // TODO(jwetzell): find a better way to dynamically load these classes
        switch (action.type) {
          case 'delay':
            return new DelayAction(action);
          case 'forward':
            return new ForwardAction(action);
          case 'http':
            return new HttpAction(action);
          case 'log':
            return new LogAction(action);
          case 'midi-output':
            return new MIDIOutputAction(action);
          case 'mqtt-output':
            return new MQTTOutputAction(action);
          case 'osc-output':
            return new OSCOutputAction(action);
          case 'shell':
            return new ShellAction(action);
          case 'store':
            return new StoreAction(action);
          case 'tcp-output':
            return new TCPOutputAction(action);
          case 'udp-output':
            return new UDPOutputAction(action);
          case 'cloud-output':
            return new CloudOutputAction(action);
          default:
            logger.error(`action: unhandled action type = ${action.type}`);
            return undefined;
        }
      });
    }
  }

  get params() {
    return this.obj.params;
  }

  get type() {
    return this.obj.type;
  }

  get enabled() {
    return this.obj.enabled;
  }

  get comment() {
    return this.obj.comment;
  }

  resolveTemplatedParams(data) {
    return resolveAllKeys(this.params, data);
  }

  toJSON() {
    return {
      comment: this.comment,
      type: this.type,
      params: this.params,
      actions: this.actions,
      enabled: this.enabled,
    };
  }
}
module.exports = Trigger;
