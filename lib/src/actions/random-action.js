import { has } from 'lodash-es';
import { Types, logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class RandomAction extends Action {
  constructor(obj) {
    super(obj);

    // NOTE(jwetzell): turn subAction JSON into class instances
    this.subActions = this.params.actions
      .filter((action) => has(Types.ActionTypeClassMap, action.type))
      .map((action) => new Types.ActionTypeClassMap[action.type](action));
  }

  _run(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.actions !== undefined) {
      const subActionIndex = Math.floor(Math.random() * this.params.actions.length);
      const subAction = this.subActions[subActionIndex];

      logger.trace(`random-action: ${subActionIndex}: ${subAction.enabled ? 'fired' : 'skipped'}`);

      subAction.on('action', (actionPath, fired) => {
        this.emit('action', `actions/${subActionIndex}/${actionPath}`, fired);
      });
      subAction.on('transform', (transformPath, enabled) => {
        this.emit('transform', `actions/${subActionIndex}/${transformPath}`, enabled);
      });
      subAction.once('finished', () => {
        this.cleanupAfterFinished();
        this.emit('finished');
      });
      this.emit('action', `actions/${subActionIndex}`, subAction.enabled);
      subAction.run(msg, vars, protocols);
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
