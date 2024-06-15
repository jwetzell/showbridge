import { MIDIMessage, Message } from '../messages/index.js';
import { RouterProtocols, RouterVars } from '../router.js';
import { logger } from '../utils/index.js';
import Action from './action.js';

type MIDIOutputActionParams =
  | MIDIBytesParams
  | MIDINoteOffMessageParams
  | MIDINoteOnMessageParams
  | MIDIPolyphonicAftertouchParams
  | MIDIControlChangeParams
  | MIDIProgramChangeParams
  | MIDIChannelAftertouchParams
  | MIDIPitchBendParams
  | MIDIStartParams
  | MIDIContinueParams
  | MIDIStopParams
  | MIDIResetParams;

type MIDIBytesParams = {
  port?: string;
  bytes: number[];
};

type MIDINoteOffMessageParams = {
  port?: string;
  status: 'note_off';
  channel: number;
  note: number;
  velocity: number;
};

type MIDINoteOnMessageParams = {
  port?: string;
  status: 'note_on';
  channel: number;
  note: number;
  velocity: number;
};

type MIDIPolyphonicAftertouchParams = {
  port?: string;
  status: 'polyphonic_aftertouch';
  channel: number;
  note: number;
  pressure: number;
};

type MIDIControlChangeParams = {
  port?: string;
  status: 'control_change';
  channel?: number;
  control: number;
  value: number;
};

type MIDIProgramChangeParams = {
  port?: string;
  status: 'program_change';
  channel?: number;
  program: number;
};

type MIDIChannelAftertouchParams = {
  port?: string;
  status: 'channel_aftertouch';
  channel?: number;
  pressure: number;
};

type MIDIPitchBendParams = {
  port?: string;
  status: 'pitch_bend';
  channel?: number;
  value: number;
};

type MIDIStartParams = {
  port?: string;
  status: 'start';
};

type MIDIContinueParams = {
  port?: string;
  status: 'continue';
};

type MIDIStopParams = {
  port?: string;
  status: 'stop';
};

type MIDIResetParams = {
  port?: string;
  status: 'reset';
};

class MIDIOutputAction extends Action<MIDIOutputActionParams> {
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
