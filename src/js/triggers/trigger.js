const { logger, resolveAllKeys } = require('../utils/helper');
const DelayAction = require('../actions/delay-action');
const ForwardAction = require('../actions/forward-action');
const HttpAction = require('../actions/http-action');
const LogAction = require('../actions/log-action');
const MIDIOutputAction = require('../actions/midi-output-action');
const MQTTOutputAction = require('../actions/mqtt-output-action');
const OSCOutputAction = require('../actions/osc-output-action');
const ShellAction = require('../actions/shell-action');
const StoreAction = require('../actions/store-action');
const TCPOutputAction = require('../actions/tcp-output-action');
const UDPOutputAction = require('../actions/udp-output-action');
const BridgeOutputAction = require('../actions/bridge-output-action');

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
          case 'bridge-output':
            return new BridgeOutputAction(action);
          default:
            logger.error(`action: unhandled action type = ${action.type}`);
            return undefined;
        }
      });
    }
  }

  get params() {
    return this.obj.params ? this.obj.params : {};
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
