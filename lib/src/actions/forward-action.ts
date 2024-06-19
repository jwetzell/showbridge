import { ForwardActionParms, RouterVars } from '@showbridge/types';
import { ByteMessage } from '../messages/index.js';
import { RouterProtocols } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class ForwardAction extends Action<ForwardActionParms> {
  _run(_msg: ByteMessage, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage<ByteMessage>(_msg, vars);
    try {
      const msgToForward = msg.bytes;

      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      if (msgToForward === undefined) {
        logger.error('action: this is not a forwardable message type');
        return;
      }

      if (resolvedParams.protocol === 'udp') {
        protocols.udp.send(Buffer.from(msgToForward), resolvedParams.port, resolvedParams.host);
      } else if (resolvedParams.protocol === 'tcp') {
        protocols.tcp.send(
          Buffer.from(msgToForward),
          resolvedParams.port,
          resolvedParams.host,
          msg.messageType === 'osc'
        );
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
