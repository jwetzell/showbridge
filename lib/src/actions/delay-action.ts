import { has } from 'lodash-es';
import { Message } from '../messages/index.js';
import { RouterProtocols, RouterVars } from '../router.js';
import { logger } from '../utils/index.js';
import Action, { ActionObj } from './action.js';
import { ActionTypeClassMap } from './index.js';

type DelayActionParams = {
  duration?: number;
  actions: ActionObj<unknown>[];
};

class DelayAction extends Action<DelayActionParams> {
  subActions: Action<unknown>[];

  constructor(obj: ActionObj<DelayActionParams>) {
    super(obj);

    // NOTE(jwetzell): turn subAction JSON into class instances
    this.subActions = this.params.actions
      .filter((action) => has(ActionTypeClassMap, action.type))
      .map((action) => new ActionTypeClassMap[action.type](action));
  }

  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.duration !== undefined && this.params.actions !== undefined) {
      setTimeout(() => {
        let subActionsFinished = 0;
        this.subActions.forEach((subAction, subActionIndex) => {
          logger.trace(`delay-action: ${subActionIndex}: ${subAction.enabled ? 'fired' : 'skipped'}`);

          subAction.on('action', (actionPath, fired) => {
            this.emit('action', subAction, `actions/${subActionIndex}/${actionPath}`, fired);
          });
          subAction.on('transform', (transformPath, enabled) => {
            this.emit('transform', `actions/${subActionIndex}/${transformPath}`, enabled);
          });
          subAction.once('finished', () => {
            subActionsFinished += 1;
            if (subActionsFinished === this.subActions.length) {
              this.cleanupAfterFinished();
              this.emit('finished');
            }
          });
          this.emit('action', subAction, `actions/${subActionIndex}`, subAction.enabled);
          subAction.run(msg, vars, protocols);
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
