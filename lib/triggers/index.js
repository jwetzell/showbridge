const BytesEqualTrigger = require('./bytes-equal-trigger');
const MIDIControlChangeTrigger = require('./midi-control-change-trigger');
const MIDINoteOffTrigger = require('./midi-note-off-trigger');
const MIDINoteOnTrigger = require('./midi-note-on-trigger');
const MIDIProgramChangeTrigger = require('./midi-program-change-trigger');
const OSCAddressTrigger = require('./osc-address-trigger');
const RegexTrigger = require('./regex-trigger');
const SenderTrigger = require('./sender-trigger');
const AnyTrigger = require('./any-trigger');

module.exports = {
  BytesEqualTrigger,
  MIDIControlChangeTrigger,
  MIDINoteOffTrigger,
  MIDINoteOnTrigger,
  MIDIProgramChangeTrigger,
  OSCAddressTrigger,
  RegexTrigger,
  SenderTrigger,
  AnyTrigger,
};
