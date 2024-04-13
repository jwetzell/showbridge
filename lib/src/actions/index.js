/**
 * @module Actions
 */
import CloudOutputAction from './cloud-output-action.js';
import DelayAction from './delay-action.js';
import ForwardAction from './forward-action.js';
import HTTPRequestAction from './http-request-action.js';
import HTTPResponseAction from './http-response-action.js';
import LogAction from './log-action.js';
import MIDIOutputAction from './midi-output-action.js';
import MQTTOutputAction from './mqtt-output-action.js';
import OSCOutputAction from './osc-output-action.js';
import RandomAction from './random-action.js';
import ShellAction from './shell-action.js';
import StoreAction from './store-action.js';
import TCPOutputAction from './tcp-output-action.js';
import UDPOutputAction from './udp-output-action.js';

export {
  CloudOutputAction,
  DelayAction,
  ForwardAction,
  HTTPRequestAction,
  HTTPResponseAction,
  LogAction,
  MIDIOutputAction,
  MQTTOutputAction,
  OSCOutputAction,
  RandomAction,
  ShellAction,
  StoreAction,
  TCPOutputAction,
  UDPOutputAction,
};

export const ActionTypeClassMap = {
  'cloud-output': CloudOutputAction,
  delay: DelayAction,
  forward: ForwardAction,
  'http-request': HTTPRequestAction,
  log: LogAction,
  'midi-output': MIDIOutputAction,
  'mqtt-output': MQTTOutputAction,
  'http-response': HTTPResponseAction,
  'osc-output': OSCOutputAction,
  random: RandomAction,
  shell: ShellAction,
  store: StoreAction,
  'tcp-output': TCPOutputAction,
  'udp-output': UDPOutputAction,
};
