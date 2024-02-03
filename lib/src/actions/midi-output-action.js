import { MIDIMessage } from '../messages/index.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

/**
 * @memberof module:Actions
 * @extends module:Actions.Action
 */
class MIDIOutputAction extends Action {
  _run(_msg, vars, protocols) {
    try {
      const msg = this.getTransformedMessage(_msg, vars);
      // TODO(jwetzell): add templating to midi-output in config.schema.json
      const resolvedParams = this.resolveTemplatedParams({ msg, vars });
      const midiToSend = MIDIMessage.parseActionParams(resolvedParams);

      if (midiToSend !== undefined) {
        protocols.midi.send(Buffer.from(midiToSend.bytes), resolvedParams.port);
      }
    } catch (error) {
      logger.error(`action: problem executing midi-output action - ${error}`);
    }
    this.emit('finished');
  }
}
export default MIDIOutputAction;
