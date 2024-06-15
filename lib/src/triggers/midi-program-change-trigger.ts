import { has } from 'lodash-es';
import { MIDIMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

type MIDIProgramChangeTriggerParams = {
  port?: string;
  channel?: number;
  program?: number;
};

class MIDIProgramChangeTrigger extends Trigger<MIDIProgramChangeTriggerParams> {
  test(msg: MIDIMessage) {
    if (msg.messageType !== 'midi') {
      logger.error('trigger: midi-program-change trigger only works on midi messages');
      return false;
    }

    if (msg.status !== 'program_change') {
      return false;
    }

    if (has(this.params, 'port') && this.params.port !== msg.port) {
      return false;
    }

    if (has(this.params, 'channel') && this.params.channel !== msg.channel) {
      return false;
    }

    if (has(this.params, 'program') && this.params.program !== msg.program) {
      return false;
    }

    // NOTE(jwetzell): if msg has passed all the above it is a match;
    return true;
  }
}

export default MIDIProgramChangeTrigger;
