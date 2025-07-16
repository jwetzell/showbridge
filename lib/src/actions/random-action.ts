import { ActionObj, RandomActionParams, RouterVars } from '@showbridge/types';
import { has } from 'lodash-es';
import { Message } from '../messages/index.js';
import { RouterProtocols } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';
import { ActionTypeClassMap } from './index.js';

class RandomAction extends Action<RandomActionParams> {
  subActions: Action<unknown>[];

  constructor(obj: ActionObj<RandomActionParams>) {
    super(obj);

    // NOTE(jwetzell): turn subAction JSON into class instances
    this.subActions = this.params.actions
      .filter((action) => has(ActionTypeClassMap, action.type))
      .map((action) => new ActionTypeClassMap[action.type](action));
  }

  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.actions !== undefined) {
      const subActionIndex = Math.floor(Math.random() * this.params.actions.length);
      const subAction = this.subActions[subActionIndex];

      logger.trace(`random-action: ${subActionIndex}: ${subAction.enabled ? 'fired' : 'skipped'}`);

      subAction.on('action', (nestedAction, actionPath, fired) => {
        this.emit('action', nestedAction, `actions/${subActionIndex}/${actionPath}`, fired);
      });
      subAction.on('transform', (transformPath, enabled) => {
        this.emit('transform', `actions/${subActionIndex}/${transformPath}`, enabled);
      });
      subAction.once('finished', () => {
        this.cleanupAfterFinished();
        this.emit('finished');
      });
      this.emit('action', subAction, `actions/${subActionIndex}`, subAction.enabled);
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
