import { RouterVars, TCPOutputActionParams } from '@showbridge/types';
import { Message } from '../messages/index.js';
import { RouterProtocols } from '../router.js';
import { hexToBytes, logger } from '../utils/index.js';
import Action from './action.js';

class TCPOutputAction extends Action<TCPOutputActionParams> {
  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);
    let tcpSend;
    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if ('bytes' in resolvedParams) {
        tcpSend = resolvedParams.bytes;
      } else if ('hex' in resolvedParams) {
        tcpSend = hexToBytes(resolvedParams.hex);
      } else if ('string' in resolvedParams) {
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
