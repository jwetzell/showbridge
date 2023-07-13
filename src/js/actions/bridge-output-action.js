const Action = require('./action');
const { logger } = require('../utils/helper');

class BridgeOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.room) {
      servers.bridge.send(this.params.room, msg);
    } else if (this.params.rooms) {
      this.params.rooms.forEach((room) => {
        servers.bridge.send(room, msg);
      });
    } else {
      logger.error('bridge-output: no room specified');
    }
  }
}
module.exports = BridgeOutputAction;
