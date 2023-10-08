import { has } from 'lodash-es';
import { ActionTypeClassMap, logger } from '../utils/index.js';
import Action from './action.js';

class DelayAction extends Action {
  constructor(obj) {
    super(obj);
    this.subActions = this.params.actions.map((action) => {
      if (has(ActionTypeClassMap, action.type)) {
        return new ActionTypeClassMap[action.type](action);
      }

      logger.error(`action: unhandled action type = ${action.type}`);
      return undefined;
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
export default DelayAction;
