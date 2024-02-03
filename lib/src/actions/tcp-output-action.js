import { hexToBytes, logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class TCPOutputAction extends Action {
  _run(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    let tcpSend;
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.bytes !== undefined) {
        tcpSend = resolvedParams.bytes;
      } else if (resolvedParams.hex !== undefined) {
        tcpSend = hexToBytes(resolvedParams.hex);
      } else if (resolvedParams.string !== undefined) {
        tcpSend = resolvedParams.string;
      }

      if (tcpSend !== undefined) {
        protocols.tcp.send(Buffer.from(tcpSend), resolvedParams.port, resolvedParams.host, resolvedParams.slip);
      } else {
        logger.error('action: tcp-output has nothing to send');
      }
    } catch (error) {
      logger.error(`action: problem executing tcp-output action - ${error}`);
    }
    this.emit('finished');
  }
}
export default TCPOutputAction;
