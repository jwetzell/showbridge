import { logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class ForwardAction extends Action {
  _run(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const msgToForward = msg.bytes;

      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (msgToForward === undefined) {
        logger.error('action: this is not a forwardable message type');
        return;
      }

      if (resolvedParams.protocol === 'udp') {
        protocols.udp.send(msgToForward, resolvedParams.port, resolvedParams.host);
      } else if (resolvedParams.protocol === 'tcp') {
        protocols.tcp.send(msgToForward, resolvedParams.port, resolvedParams.host, msg.messageType === 'osc');
      } else {
        logger.error(`action: unhandled forward protocol = ${resolvedParams.protocol}`);
      }
    } catch (error) {
      logger.error(`action: problem executing forward action - ${error}`);
    }
    this.emit('finished');
  }
}
export default ForwardAction;
