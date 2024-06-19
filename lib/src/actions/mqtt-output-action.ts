import { MQTTOutputActionParams, RouterVars } from '@showbridge/types';
import { Message } from '../messages/index.js';
import { RouterProtocols } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class MQTTOutputAction extends Action<MQTTOutputActionParams> {
  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.topic !== undefined && resolvedParams.payload !== undefined) {
        protocols.mqtt.send(resolvedParams.topic, resolvedParams.payload);
      } else {
        logger.error('action: mqtt-output missing either topic or payload');
      }
    } catch (error) {
      logger.error(`action: problem executing mqtt-output action - ${error}`);
    }
    this.emit('finished');
  }
}
export default MQTTOutputAction;
