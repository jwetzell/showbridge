const _ = require('lodash');
const Trigger = require('./trigger');
const { logger } = require('../utils');

class MIDIControlChangeTrigger extends Trigger {
  shouldFire(msg) {
    if (msg.messageType !== 'midi') {
      logger.error('trigger: midi-control-change trigger only works on midi messages');
      return false;
    }

    if (msg.status !== 'control_change') {
      return false;
    }

    if (_.has(this.params, 'port') && this.params.port !== msg.port) {
      return false;
    }

    if (_.has(this.params, 'channel') && this.params.channel !== msg.channel) {
      return false;
    }

    if (_.has(this.params, 'control') && this.params.control !== msg.control) {
      return false;
    }

    if (_.has(this.params, 'value') && this.params.value !== msg.value) {
      return false;
    }

    // NOTE(jwetzell): if msg has passed all the above it is a match;
    return true;
  }
}

module.exports = MIDIControlChangeTrigger;
