const _ = require('lodash');
const Trigger = require('./trigger');

class MIDINoteOnTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.messageType === 'midi' && msg.status === 'note_on') {
      if (this.params) {
        if (_.has(this.params, 'port') && this.params.port !== msg.port) {
          return false;
        }

        if (_.has(this.params, 'note') && this.params.note !== msg.note) {
          return false;
        }

        if (_.has(this.params, 'velocity') && this.params.velocity !== msg.velocity) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}

module.exports = MIDINoteOnTrigger;
