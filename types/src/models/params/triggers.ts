export type AnyTriggerParams = undefined;

export type BytesEqualTriggerParams = {
  bytes: number[];
};

export type HTTPRequestTriggerParams = {
  path?: string;
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
};

export type MIDITriggerParams = {
  port?: string;
};

export type MIDIControlChangeTriggerParams = {
  port?: string;
  channel?: number;
  control?: number;
  value?: number;
};

export type MIDINoteOffTriggerParams = {
  port?: string;
  channel?: number;
  note?: number;
  velocity?: number;
};

export type MIDINoteOnTriggerParams = {
  port?: string;
  channel?: number;
  note?: number;
  velocity?: number;
};

export type MIDIPitchBendTriggerParams = {
  port?: string;
  channel?: number;
  value?: number;
};

export type MIDIProgramChangeTriggerParams = {
  port?: string;
  channel?: number;
  program?: number;
};

export type MQTTTopicTriggerParams = {
  topic: string;
};

export type OSCAddressTriggerParams = {
  address: string;
};

export type RegexTriggerParams = {
  patterns: string[];
  properties: string[];
};

export type SenderTriggerParams = {
  address: string;
};

export type TriggerParams =
  | AnyTriggerParams
  | BytesEqualTriggerParams
  | HTTPRequestTriggerParams
  | MIDITriggerParams
  | MIDIControlChangeTriggerParams
  | MIDINoteOffTriggerParams
  | MIDINoteOnTriggerParams
  | MIDIPitchBendTriggerParams
  | MIDIProgramChangeTriggerParams
  | MQTTTopicTriggerParams
  | OSCAddressTriggerParams
  | RegexTriggerParams
  | SenderTriggerParams;
