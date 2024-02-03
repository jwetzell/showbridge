import {
  CloudOutputAction,
  DelayAction,
  ForwardAction,
  HttpAction,
  LogAction,
  MIDIOutputAction,
  MQTTOutputAction,
  OSCOutputAction,
  RandomAction,
  ShellAction,
  StoreAction,
  TCPOutputAction,
  UDPOutputAction,
} from '../actions/index.js';

import {
  AnyTrigger,
  BytesEqualTrigger,
  MIDIControlChangeTrigger,
  MIDINoteOffTrigger,
  MIDINoteOnTrigger,
  MIDIProgramChangeTrigger,
  OSCAddressTrigger,
  RegexTrigger,
  SenderTrigger,
} from '../triggers/index.js';

import {
  HTTPMessage,
  MIDIMessage,
  MQTTMessage,
  OSCMessage,
  TCPMessage,
  UDPMessage,
  WebSocketMessage,
} from '../messages/index.js';

import {
  FloorTransform,
  LogTransform,
  MapTransform,
  PowerTransform,
  RoundTransform,
  ScaleTransform,
  TemplateTransform,
} from '../transforms/index.js';

export const ActionTypeClassMap = {
  'cloud-output': CloudOutputAction,
  delay: DelayAction,
  forward: ForwardAction,
  http: HttpAction,
  log: LogAction,
  'midi-output': MIDIOutputAction,
  'mqtt-output': MQTTOutputAction,
  'osc-output': OSCOutputAction,
  random: RandomAction,
  shell: ShellAction,
  store: StoreAction,
  'tcp-output': TCPOutputAction,
  'udp-output': UDPOutputAction,
};

export const TriggerTypeClassMap = {
  any: AnyTrigger,
  'bytes-equal': BytesEqualTrigger,
  'midi-control-change': MIDIControlChangeTrigger,
  'midi-note-off': MIDINoteOffTrigger,
  'midi-note-on': MIDINoteOnTrigger,
  'midi-program-change': MIDIProgramChangeTrigger,
  'osc-address': OSCAddressTrigger,
  regex: RegexTrigger,
  sender: SenderTrigger,
};

export const MessageTypeClassMap = {
  http: HTTPMessage,
  midi: MIDIMessage,
  mqtt: MQTTMessage,
  osc: OSCMessage,
  tcp: TCPMessage,
  udp: UDPMessage,
  ws: WebSocketMessage,
};

export const TransformTypeClassMap = {
  floor: FloorTransform,
  log: LogTransform,
  map: MapTransform,
  power: PowerTransform,
  round: RoundTransform,
  scale: ScaleTransform,
  template: TemplateTransform,
};
