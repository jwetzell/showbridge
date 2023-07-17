const Action = require('./action');
const { logger } = require('../utils/helper');

class MQTTOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);

    try {
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });

      if (resolvedParams.topic !== undefined && resolvedParams.payload !== undefined) {
        servers.mqtt.send(resolvedParams.topic, resolvedParams.payload);
      } else {
        logger.error('action: mqtt-output missing either topic or payload');
      }
    } catch (error) {
      logger.error(`action: problem executing mqtt-output action - ${error}`);
    }
  }
}
module.exports = MQTTOutputAction;
