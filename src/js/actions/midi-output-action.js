const Action = require('./action');
const { logger } = require('../utils/helper');
const MIDIMessage = require('../messages/midi-message');

class MIDIOutputAction extends Action {
  do(_msg, vars, servers) {
    try {
      // TODO(jwetzell): add templating to midi-output
      // TODO(jwetzell): see if there is a way to switch ports when outputting
      const midiToSend = MIDIMessage.parseActionParams(this.params);
      if (midiToSend !== undefined) {
        servers.midi.send(Buffer.from(midiToSend.bytes));
      }
    } catch (error) {
      logger.error(`action: error outputting midi - ${error}`);
    }
  }
}
module.exports = MIDIOutputAction;
