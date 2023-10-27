import { hexToBytes, logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class UDPOutputAction extends Action {
  doFunction(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    let udpSend;
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.bytes !== undefined) {
        udpSend = resolvedParams.bytes;
      } else if (resolvedParams.hex !== undefined) {
        udpSend = hexToBytes(resolvedParams.hex);
      } else if (resolvedParams.string !== undefined) {
        udpSend = resolvedParams.string;
      }

      if (udpSend !== undefined) {
        protocols.udp.send(Buffer.from(udpSend), resolvedParams.port, resolvedParams.host);
      } else {
        logger.error('action: udp-output has nothing to send');
      }
    } catch (error) {
      logger.error(`action: problem executing udp-output action - ${error}`);
    }
    this.emit('finished');
  }
}
export default UDPOutputAction;
