import { ActionObj } from '../action';

export type ContentType =
  | 'text/plain'
  | 'text/html'
  | 'text/csv'
  | 'application/json'
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'audio/wav'
  | 'audio/webm'
  | 'video/mp4'
  | 'video/mpeg'
  | 'video/webm';

export type HTTPResponseActionParams = FileBodyParams | StringBodyParams;

type FileBodyParams = {
  contentType?: ContentType;
  path?: string;
};

type StringBodyParams = {
  contentType?: ContentType;
  path?: string;
};

export type UDPOutputActionParams = UDPBytesParams | UDPHexParams | UDPStringParams;

type UDPBytesParams = {
  host?: string;
  port?: number;
  slip: boolean;
  bytes: number[];
};

type UDPHexParams = {
  host?: string;
  port?: number;
  slip: boolean;
  hex: string;
};

type UDPStringParams = {
  host?: string;
  port?: number;
  slip: boolean;
  string?: string;
};

export type TCPOutputActionParams = TCPBytesParams | TCPHexParams | TCPStringParams;

type TCPBytesParams = {
  host?: string;
  port?: number;
  slip: boolean;
  bytes: number[];
};

type TCPHexParams = {
  host?: string;
  port?: number;
  slip: boolean;
  hex: string;
};

type TCPStringParams = {
  host?: string;
  port?: number;
  slip: boolean;
  string?: string;
};

export type MIDIOutputActionParams =
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

export type HTTPRequestActionParams = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  contentType?: string;
  body?: string;
};

export type ForwardActionParms = {
  host?: string;
  port?: number;
  protocol: 'udp' | 'tcp';
};

export type DelayActionParams = {
  duration?: number;
  actions: ActionObj<unknown>[];
};

export type CloudOutputActionParams = {
  room?: string;
  rooms?: string[];
};

export type LogActionParams = {};

export type MQTTOutputActionParams = {
  topic?: string;
  payload?: string;
};

export type OSCOutputActionParams = {
  host?: string;
  port?: number;
  protocol: 'udp' | 'tcp';
  address?: string;
  args?: string[];
};

export type RandomActionParams = {
  actions: ActionObj<unknown>[];
};

export type ShellActionParams = {
  command: string;
};

export type StoreActionParams = {
  key: string;
  value: string;
};
