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

  doFunction(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.duration !== undefined && this.params.actions !== undefined) {
      setTimeout(() => {
        let subActionsFinished = 0;
        this.subActions.forEach((subAction, subActionIndex) => {
          logger.trace(`delay-action: ${subActionIndex}: ${subAction.enabled ? 'fired' : 'skipped'}`);

          subAction.on('action', (action, actionIndex, fired) => {
            this.emit('action', action, `${subActionIndex}/actions/${actionIndex}`, fired);
          });
          subAction.on('transform', (transform, transformPath, enabled) => {
            this.emit('transform', transform, `actions/${subActionIndex}/${transformPath}`, enabled);
          });
          subAction.once('finished', () => {
            subActionsFinished += 1;
            if (subActionsFinished === this.subActions.length) {
              this.cleanupAfterFinished();
              this.emit('finished');
            }
          });
          this.emit('action', subAction.toJSON(), subActionIndex, subAction.enabled);
          subAction.do(msg, vars, protocols);
        });
      }, this.params.duration);
    }
  }

  cleanupAfterFinished() {
    // remove listeners
    this.subActions.forEach((subAction) => {
      subAction.removeAllListeners('action');
      subAction.removeAllListeners('transform');
    });
  }
}
module.exports = DelayAction;
