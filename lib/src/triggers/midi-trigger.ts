import { MIDITriggerParams, RouterVars } from '@showbridge/types';
import { has } from 'lodash-es';
import { MIDIMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Trigger from './trigger.js';

class MIDITrigger extends Trigger<MIDITriggerParams> {
  test(msg: MIDIMessage, vars: RouterVars) {
    if (msg.messageType !== 'midi') {
      logger.error('trigger: midi trigger only works on midi messages');
      return false;
    }

    const resolvedParams = this.resolveTemplatedParams({ msg, vars });

    if (has(resolvedParams, 'port') && resolvedParams.port !== msg.port) {
      return false;
    }

    // NOTE(jwetzell): if msg has passed all the above it is a match;
    return true;
  }
}

export default MIDITrigger;
