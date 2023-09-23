import { cloneDeep, has, set, template } from 'lodash-es';
import pino from 'pino';
import pretty from 'pino-pretty';

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
  AndTrigger,
  AnyTrigger,
  BytesEqualTrigger,
  MIDIControlChangeTrigger,
  MIDINoteOffTrigger,
  MIDINoteOnTrigger,
  MIDIProgramChangeTrigger,
  OSCAddressTrigger,
  OrTrigger,
  RegexTrigger,
  SenderTrigger,
} from '../triggers/index.js';

export function resolveTemplatedProperty(params, property, data) {
  if (has(params, `_${property}`)) {
    // if we have a template versin of the property
    const templatedProperty = params[`_${property}`];

    // process arrays items one by one
    if (Array.isArray(templatedProperty)) {
      const processedOutput = [];
      templatedProperty.forEach((item) => {
        // only template string types
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

export const TypeClassMap = {
  delay: DelayAction,
  forward: ForwardAction,
  http: HttpAction,
  log: LogAction,
  'midi-output': MIDIOutputAction,
  'mqtt-output': MQTTOutputAction,
  'osc-output': OSCOutputAction,
  shell: ShellAction,
  store: StoreAction,
  'tcp-output': TCPOutputAction,
  'udp-output': UDPOutputAction,
  'cloud-output': CloudOutputAction,
  random: RandomAction,
};

export const TriggerTypeClassMap = {
  'bytes-equal': BytesEqualTrigger,
  'midi-control-change': MIDIControlChangeTrigger,
  'midi-note-off': MIDINoteOffTrigger,
  'midi-note-on': MIDINoteOnTrigger,
  'midi-program-change': MIDIProgramChangeTrigger,
  'osc-address': OSCAddressTrigger,
  regex: RegexTrigger,
  sender: SenderTrigger,
  any: AnyTrigger,
  and: AndTrigger,
  or: OrTrigger,
};

// TODO(jwetzell): sort out logging
export const logger = pino(pretty());
