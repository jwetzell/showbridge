import { MIDIMessage, Message } from '../messages/index.js';
import { RouterProtocols, RouterVars } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class MIDIOutputAction extends Action {
  _run(_msg: Message, vars: RouterVars, protocols: RouterProtocols) {
    try {
      const msg = this.getTransformedMessage(_msg, vars);
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const midiToSend = MIDIMessage.parseActionParams(resolvedParams);

      if (midiToSend !== undefined) {
        protocols.midi.send(midiToSend.bytes, resolvedParams.port);
      }
    } catch (error) {
      logger.error(`action: problem executing midi-output action - ${error}`);
    }
    this.emit('finished');
  }
}
export default MIDIOutputAction;
