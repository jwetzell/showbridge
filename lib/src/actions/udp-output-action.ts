import { Message } from '../messages/index.js';
import { RouterProtocols, RouterVars } from '../router.js';
import { hexToBytes, logger } from '../utils/index.js';
import Action from './action.js';

type UDPOutputActionParams = UDPBytesParams | UDPHexParams | UDPStringParams;

type UDPBytesParams = {
  host?: string;
  port?: number;
  slip: boolean;
  bytes: number[];
};

type UDPHexParams = {
  host?: string;
  port?: number;
  slip: boolean;
  hex: string;
};

type UDPStringParams = {
  host?: string;
  port?: number;
  slip: boolean;
  string?: string;
};

class UDPOutputAction extends Action<UDPOutputActionParams> {
  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    let udpSend;
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if ('bytes' in resolvedParams) {
        udpSend = resolvedParams.bytes;
      } else if ('hex' in resolvedParams) {
        udpSend = hexToBytes(resolvedParams.hex);
      } else if ('string' in resolvedParams) {
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
