import { TriggerParams } from './params';
import { ProtocolParams } from './params/protocols';
import { ProtocolObj } from './protocol';
import { TriggerObj } from './trigger';

export type MessageTypeObj = {
  triggers: TriggerObj<TriggerParams>[];
};

export type ConfigObj = {
  $schema?: string;
  protocols: ProtocolObj<ProtocolParams>[];
  http: MessageTypeObj;
  ws: MessageTypeObj;
  osc: MessageTypeObj;
  tcp: MessageTypeObj;
  udp: MessageTypeObj;
  midi: MessageTypeObj;
  mqtt: MessageTypeObj;
  cloud: MessageTypeObj;
};
