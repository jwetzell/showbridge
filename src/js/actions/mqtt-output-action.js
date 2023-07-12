const Action = require('./action');
const { logger, resolveTemplatedProperty } = require('../utils/helper');

class MQTTOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    const topic = resolveTemplatedProperty(this.params, 'topic', { msg, vars });
    const payload = resolveTemplatedProperty(this.params, 'payload', { msg, vars });

    if (topic !== undefined && payload !== undefined) {
      servers.mqtt.send(topic, payload);
    } else {
      logger.error('action: mqtt-output missing either topic or payload');
    }
  }
}
module.exports = MQTTOutputAction;
