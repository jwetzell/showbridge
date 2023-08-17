const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils');

class MIDINoteOffTrigger extends Trigger {
  test(msg) {
    if (msg.messageType !== 'midi') {
      logger.error('trigger: midi-note-off trigger only works on midi messages');
      return false;
    }

    if (msg.status !== 'note_off') {
      return false;
    }

    if (_.has(this.params, 'port') && this.params.port !== msg.port) {
      return false;
    }

    if (_.has(this.params, 'channel') && this.params.channel !== msg.channel) {
      return false;
    }

    if (_.has(this.params, 'note') && this.params.note !== msg.note) {
      return false;
    }

    if (_.has(this.params, 'velocity') && this.params.velocity !== msg.velocity) {
      return false;
    }

    // NOTE(jwetzell): if msg has passed all the above it is a match;
    return true;
  }
}

module.exports = MIDINoteOffTrigger;
