import { cloneDeep, has, set, template } from 'lodash-es';
import pino from 'pino';

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

export function resolveTemplatedProperty(params, property, data) {
  if (has(params, `_${property}`)) {
    // NOTE(jwetzell): if we have a template version of the property
    const templatedProperty = params[`_${property}`];

    // NOTE(jwetzell): process arrays items one by one
    if (Array.isArray(templatedProperty)) {
      const processedOutput = [];
      templatedProperty.forEach((item) => {
        // NOTE(jwetzell): only template string types
        if (typeof item === 'string') {
          let templateResult = template(item)(data);
          if (!Number.isNaN(templateResult * 1)) {
            if (templateResult.includes('.')) {
              templateResult = parseFloat(templateResult);
            } else {
              templateResult = parseInt(templateResult, 10);
            }
          } else if (templateResult === 'true') {
            templateResult = true;
          } else if (templateResult === 'false') {
            templateResult = false;
          }
          processedOutput.push(templateResult);
        } else {
          processedOutput.push(item);
        }
      });
      return processedOutput;
    }
    if (typeof templatedProperty === 'string') {
      return template(templatedProperty)(data);
    }
    return templatedProperty;
  }
  if (has(params, property)) {
    return params[property];
  }
  return undefined;
}

export function resolveAllKeys(_obj, data) {
  const obj = cloneDeep(_obj);
  Object.keys(obj)
    .filter((key) => key.startsWith('_'))
    .forEach((templateKey) => {
      // NOTE(jwetzell): essentially replace _key: "${msg.property}" with key: "resolvedValue"
      const cleanKey = templateKey.replace('_', '');
      set(obj, cleanKey, resolveTemplatedProperty(obj, cleanKey, data));
      delete obj[templateKey];
    });
  return obj;
}

export function hexToBytes(hex) {
  const cleanHex = hex.replaceAll(' ', '').replaceAll('0x', '').replaceAll(',', '');
  const bytes = [];
  for (let c = 0; c < cleanHex.length; c += 2) {
    bytes.push(parseInt(cleanHex.substr(c, 2), 16));
  }
  return bytes;
}

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

export const disabled = {
  actions: new Set(),
  protocols: new Set(),
  triggers: new Set(),
  // TODO(jwetzell): implement disable for the following
  transforms: new Set(),
};

export const logger = pino();
