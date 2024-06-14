import { Message } from '../messages/index.js';
import { RouterProtocols, RouterVars } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class CloudOutputAction extends Action {
  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.room) {
        protocols.cloud.send(resolvedParams.room, msg);
      } else if (resolvedParams.rooms) {
        resolvedParams.rooms.forEach((room) => {
          protocols.cloud.send(room, msg);
        });
      } else {
        logger.error('action: cloud-output action has no room specified');
      }
    } catch (error) {
      logger.error(`action: problem executing cloud-output action - ${error}`);
    }
    this.emit('finished');
  }
}
export default CloudOutputAction;
