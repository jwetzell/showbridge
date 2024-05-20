/**
 * @module Triggers
 */
import AnyTrigger from './any-trigger.js';
import BytesEqualTrigger from './bytes-equal-trigger.js';
import HTTPRequestTrigger from './http-request-trigger.js';
import MIDIControlChangeTrigger from './midi-control-change-trigger.js';
import MIDINoteOffTrigger from './midi-note-off-trigger.js';
import MIDINoteOnTrigger from './midi-note-on-trigger.js';
import MIDIPitchBendTrigger from './midi-pitch-bend-trigger.js';
import MIDIProgramChangeTrigger from './midi-program-change-trigger.js';
import MQTTTopicTrigger from './mqtt-topic-trigger.js';
import OSCAddressTrigger from './osc-address-trigger.js';
import RegexTrigger from './regex-trigger.js';
import SenderTrigger from './sender-trigger.js';
import Trigger from './trigger.js';

export {
  AnyTrigger,
  BytesEqualTrigger,
  HTTPRequestTrigger,
  MIDIControlChangeTrigger,
  MIDINoteOffTrigger,
  MIDINoteOnTrigger,
  MIDIPitchBendTrigger,
  MIDIProgramChangeTrigger,
  MQTTTopicTrigger,
  OSCAddressTrigger,
  RegexTrigger,
  SenderTrigger,
  Trigger,
};

export const TriggerTypeClassMap = {
  any: AnyTrigger,
  'bytes-equal': BytesEqualTrigger,
  'http-request': HTTPRequestTrigger,
  'midi-control-change': MIDIControlChangeTrigger,
  'midi-note-off': MIDINoteOffTrigger,
  'midi-note-on': MIDINoteOnTrigger,
  'midi-pitch-bend': MIDIPitchBendTrigger,
  'midi-program-change': MIDIProgramChangeTrigger,
  'osc-address': OSCAddressTrigger,
  'mqtt-topic': MQTTTopicTrigger,
  regex: RegexTrigger,
  sender: SenderTrigger,
};
