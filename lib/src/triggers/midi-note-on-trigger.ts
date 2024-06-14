import { has } from 'lodash-es';
import { MIDIMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class MIDINoteOnTrigger extends Trigger {
  test(msg: MIDIMessage) {
    if (msg.messageType !== 'midi') {
      logger.error('trigger: midi-note-on trigger only works on midi messages');
      return false;
    }

    if (msg.status !== 'note_on') {
      return false;
    }

    if (has(this.params, 'port') && this.params.port !== msg.port) {
      return false;
    }

    if (has(this.params, 'channel') && this.params.channel !== msg.channel) {
      return false;
    }

    if (has(this.params, 'note') && this.params.note !== msg.note) {
      return false;
    }

    if (has(this.params, 'velocity') && this.params.velocity !== msg.velocity) {
      return false;
    }

    // NOTE(jwetzell): if msg has passed all the above it is a match;
    return true;
  }
}

export default MIDINoteOnTrigger;
