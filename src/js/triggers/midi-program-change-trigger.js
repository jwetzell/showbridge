const _ = require('lodash');
const Trigger = require('./trigger');

class MIDIProgramChangeTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.messageType === 'midi' && msg.status === 'program_change') {
      if (this.params) {
        if (_.has(this.params, 'port') && this.params.port !== msg.port) {
          return false;
        }

        if (_.has(this.params, 'program') && this.params.program !== msg.program) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}

module.exports = MIDIProgramChangeTrigger;
