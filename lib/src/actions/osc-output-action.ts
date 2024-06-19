import { OSCOutputActionParams, RouterVars } from '@showbridge/types';
import osc, { OscArgument } from 'osc-min';
import { Message } from '../messages/index.js';
import { RouterProtocols } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class OSCOutputAction extends Action<OSCOutputActionParams> {
  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams === undefined) {
        logger.error('action: params need to be set for osc-output action');
        return;
      }

      if (resolvedParams.address === undefined) {
        logger.error('action: either address or _address property need to be set for osc-output action');
        return;
      }

      if (resolvedParams.args === undefined) {
        resolvedParams.args = [];
      }

      const typedArgs = resolvedParams.args.map((arg) => {
        const typedArg: OscArgument = {
          type: 'string',
          value: arg,
        };
        switch (typeof arg) {
          case 'number':
            typedArg.type = Number.isInteger(arg) ? 'integer' : 'float';
            break;
          case 'boolean':
            typedArg.type = arg ? 'true' : 'false';
            break;
          case 'string':
          default:
            break;
        }
        return typedArg;
      });

      const outBuff = osc.toBuffer({
        address: resolvedParams.address,
        args: typedArgs,
        oscType: 'message',
      });

      if (resolvedParams.protocol === 'udp') {
        protocols.udp.send(outBuff, resolvedParams.port, resolvedParams.host);
      } else if (resolvedParams.protocol === 'tcp') {
        protocols.tcp.send(outBuff, resolvedParams.port, resolvedParams.host, true);
      } else {
        logger.error(`action: unhandled osc output protocol = ${resolvedParams.protocol}`);
      }
    } catch (error) {
      logger.error(`action: problem executing osc-output action - ${error}`);
    }
    this.emit('finished');
  }
}

export default OSCOutputAction;
