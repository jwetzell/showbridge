const _ = require('lodash');
const Trigger = require('./trigger');

class MIDIControlChangeTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.messageType === 'midi' && msg.status === 'control_change') {
      if (this.params) {
        if (_.has(this.params, 'port') && this.params.port !== msg.port) {
          return false;
        }

        if (_.has(this.params, 'control') && this.params.control !== msg.control) {
          return false;
        }

        if (_.has(this.params, 'value') && this.params.value !== msg.value) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}

module.exports = MIDIControlChangeTrigger;
