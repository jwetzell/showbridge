import { has } from 'lodash-es';
import { ActionTypeClassMap, logger } from '../utils/index.js';
import Action from './action.js';

class RandomAction extends Action {
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
    if (this.params.actions !== undefined) {
      const subActionIndex = Math.floor(Math.random() * this.params.actions.length);
      const subAction = this.subActions[subActionIndex];

      logger.trace(`random-action: ${subActionIndex}: ${subAction.enabled ? 'fired' : 'skipped'}`);

      subAction.on('action', (action, actionIndex, fired) => {
        this.emit('action', action, `${subActionIndex}/actions/${actionIndex}`, fired);
      });
      subAction.on('transform', (transform, transformPath, enabled) => {
        this.emit('transform', transform, `actions/${subActionIndex}/${transformPath}`, enabled);
      });
      subAction.once('finished', () => {
        this.cleanupAfterFinished();
        this.emit('finished');
      });
      this.emit('action', subAction.toJSON(), subActionIndex, subAction.enabled);
      subAction.do(msg, vars, protocols);
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
export default RandomAction;
