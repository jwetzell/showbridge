import { TriggerParams } from './params';
import {
  CloudProtocolParams,
  HTTPProtocolParams,
  MIDIProtocolParams,
  MQTTProtocolParams,
  TCPProtocolParams,
  UDPProtocolParams,
} from './params/protocols';
import { ProtocolObj } from './protocol';
import { TriggerObj } from './trigger';

export type HandlerObj = {
  triggers: TriggerObj<TriggerParams>[];
};

export type ConfigObj = {
  $schema?: string;
  protocols: {
    cloud: ProtocolObj<CloudProtocolParams>;
    http: ProtocolObj<HTTPProtocolParams>;
    midi: ProtocolObj<MIDIProtocolParams>;
    mqtt: ProtocolObj<MQTTProtocolParams>;
    tcp: ProtocolObj<TCPProtocolParams>;
    udp: ProtocolObj<UDPProtocolParams>;
  };
  handlers: {
    http: HandlerObj;
    midi: HandlerObj;
    mqtt: HandlerObj;
    osc: HandlerObj;
    tcp: HandlerObj;
    udp: HandlerObj;
    ws: HandlerObj;
  };
};
