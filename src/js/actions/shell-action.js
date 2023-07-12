const { exec } = require('child_process');
const Action = require('./action');
const { logger, resolveTemplatedProperty } = require('../utils/helper');

class ShellAction extends Action {
  do(_msg, vars) {
    const msg = this.getTransformedMessage(_msg, vars);
    try {
      const command = resolveTemplatedProperty(this.params, 'command', { msg, vars });
      if (command !== undefined && command !== '') {
        exec(command);
      }
    } catch (error) {
      logger.error(`action: problem executing shell action - ${error}`);
    }
  }
}
module.exports = ShellAction;
