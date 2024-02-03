import { has } from 'lodash-es';
import osc from 'osc-min';
import { logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class OSCOutputAction extends Action {
  _run(_msg, vars, protocols) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (!has(resolvedParams, 'address')) {
        logger.error('action: either address or _address property need to be set for osc-output action');
        return;
      }
      if (!has(resolvedParams, 'args')) {
        resolvedParams.args = [];
      }

      const typedArgs = resolvedParams.args.map((arg) => {
        const typedArg = {
          type: 'string',
          value: arg,
        };
        switch (typeof arg) {
          case 'number':
            typedArg.type = Number.isInteger(arg) ? 'integer' : 'float';
            break;
          case 'boolean':
            typedArg.type = 'boolean';
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
