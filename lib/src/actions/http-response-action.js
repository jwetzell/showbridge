import { logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class HTTPResponseAction extends Action {
  _run(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (msg.response) {
        msg.response.status(200).send(resolvedParams.body);
      } else {
        logger.error('action: http-response action called from a non http context');
      }
    } catch (error) {
      logger.error(`action: problem executing http-response action - ${error}`);
    }
    this.emit('finished');
  }
}
export default HTTPResponseAction;
