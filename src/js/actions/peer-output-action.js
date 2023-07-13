const Action = require('./action');
const { logger } = require('../utils/helper');

class PeerOutputAction extends Action {
  do(_msg, vars, servers) {
    const msg = this.getTransformedMessage(_msg, vars);
    if (this.params.room) {
      servers.peer.send(this.params.room, msg);
    } else {
      logger.error('peer-output: no room specified');
    }
  }
}
module.exports = PeerOutputAction;
