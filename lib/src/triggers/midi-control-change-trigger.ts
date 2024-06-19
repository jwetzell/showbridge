import { MIDIControlChangeTriggerParams } from '@showbridge/types';
import { has } from 'lodash-es';
import { MIDIMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class MIDIControlChangeTrigger extends Trigger<MIDIControlChangeTriggerParams> {
  test(msg: MIDIMessage) {
    if (msg.messageType !== 'midi') {
      logger.error('trigger: midi-control-change trigger only works on midi messages');
      return false;
    }

    if (msg.status !== 'control_change') {
      return false;
    }

    if (has(this.params, 'port') && this.params.port !== msg.port) {
      return false;
    }

    if (has(this.params, 'channel') && this.params.channel !== msg.channel) {
      return false;
    }

    if (has(this.params, 'control') && this.params.control !== msg.control) {
      return false;
    }

    if (has(this.params, 'value') && this.params.value !== msg.value) {
      return false;
    }

    // NOTE(jwetzell): if msg has passed all the above it is a match;
    return true;
  }
}

export default MIDIControlChangeTrigger;
