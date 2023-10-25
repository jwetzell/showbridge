import { has } from 'lodash-es';
import { ActionTypeClassMap, logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class DelayAction extends Action {
  constructor(obj) {
    super(obj);

    // NOTE(jwetzell): turn subAction JSON into class instances
    this.subActions = this.params.actions
      .filter((action) => has(ActionTypeClassMap, action.type))
      .map((action) => new ActionTypeClassMap[action.type](action));
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
    // NOTE(jwetzell): remove listeners
    this.subActions.forEach((subAction) => {
      subAction.removeAllListeners('action');
      subAction.removeAllListeners('transform');
    });
  }
}
export default DelayAction;
