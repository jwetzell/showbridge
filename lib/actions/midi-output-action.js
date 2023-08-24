import { MIDIMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

class MIDIOutputAction extends Action {
  doFunction(_msg, vars, protocols) {
    try {
      const msg = this.getTransformedMessage(_msg, vars);
      // TODO(jwetzell): add templating to midi-output in config.schema.json
      // TODO(jwetzell): see if there is a way to switch ports when outputting
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const midiToSend = MIDIMessage.parseActionParams(resolvedParams);

      if (midiToSend !== undefined) {
        protocols.midi.send(Buffer.from(midiToSend.bytes));
      }
    } catch (error) {
      logger.error(`action: problem executing midi-output action - ${error}`);
    }
    this.emit('finished');
  }
}
export default MIDIOutputAction;
