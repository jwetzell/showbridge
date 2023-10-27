import { logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class MQTTOutputAction extends Action {
  doFunction(_msg, vars, protocols) {
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
