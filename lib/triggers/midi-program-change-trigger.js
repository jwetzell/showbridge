const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils/helper');

class MIDIProgramChangeTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.messageType !== 'midi') {
      logger.error('trigger: midi-program-change trigger only works on midi messages');
      return false;
    }

    if (msg.status !== 'program_change') {
      return false;
    }

    if (_.has(this.params, 'port') && this.params.port !== msg.port) {
      return false;
    }

    if (_.has(this.params, 'program') && this.params.program !== msg.program) {
      return false;
    }

    // NOTE(jwetzell): if msg has passed all the above it is a match;
    return true;
  }
}

module.exports = MIDIProgramChangeTrigger;
