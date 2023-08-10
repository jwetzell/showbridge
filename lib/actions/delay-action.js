const Action = require('./action');
const { logger } = require('../utils');
const {
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
} = require('.');

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
        case 'cloud-output':
          return new CloudOutputAction(action);
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
        this.subActions.forEach((subAction, subActionIndex) => {
          if (!subAction.enabled) {
            logger.debug(`delay-action: ${subActionIndex}: not enabled`);
            return;
          }
          // TODO(jwetzell): emit events for these actions and their transforms
          subAction.do(msg, vars, protocols);
        });
      }, this.params.duration);
    }
  }
}
module.exports = DelayAction;
