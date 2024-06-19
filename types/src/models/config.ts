import { TriggerObj } from './trigger';

export type ProtocolObj = {
  params: { [key: string]: any };
  triggers: TriggerObj<unknown>[];
};

export type ConfigObj = {
  $schema?: string;
  http: ProtocolObj;
  ws: ProtocolObj;
  osc: ProtocolObj;
  tcp: ProtocolObj;
  udp: ProtocolObj;
  midi: ProtocolObj;
  mqtt: ProtocolObj;
  cloud: ProtocolObj;
};
