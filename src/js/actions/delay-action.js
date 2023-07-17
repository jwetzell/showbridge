const Action = require('./action');
const { logger } = require('../utils/helper');
const ForwardAction = require('./forward-action');
const HttpAction = require('./http-action');
const LogAction = require('./log-action');
const MIDIOutputAction = require('./midi-output-action');
const MQTTOutputAction = require('./mqtt-output-action');
const OSCOutputAction = require('./osc-output-action');
const ShellAction = require('./shell-action');
const StoreAction = require('./store-action');
const TCPOutputAction = require('./tcp-output-action');
const UDPOutputAction = require('./udp-output-action');

class DelayAction extends Action {
  constructor(obj) {
    super(obj);
    this.subActions = this.params.actions.map((action) => {
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

        default:
          logger.error(`action: unhandled action type = ${action.type}`);
          return undefined;
      }
    });
  }

  do(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.duration !== undefined && this.params.actions !== undefined) {
      setTimeout(() => {
        this.subActions.forEach((subAction) => {
          subAction.do(msg, vars, protocols);
        });
      }, this.params.duration);
    }
  }
}
module.exports = DelayAction;
