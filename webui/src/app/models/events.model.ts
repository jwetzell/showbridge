export type MessageEventData = {
  eventName: 'messageIn';
  data: {
    type: string;
  };
};

export type TriggerEventData = {
  eventName: 'trigger';
  data: {
    path: string;
    fired: boolean;
  };
};

export type ActionEventData = {
  eventName: 'action';
  data: {
    path: string;
    fired: boolean;
  };
};

export type TransformEventData = {
  eventName: 'transform';
  data: {
    path: string;
    fired: boolean;
  };
};

export type ProtocolStatusEventData = {
  eventName?: 'protocolStatus';
  data: {
    cloud?: CloudStatus;
    http?: HTTPStatus;
    midi?: MIDIStatus;
    mqtt?: MQTTStatus;
    tcp?: TCPStatus;
    udp?: UDPStatus;
  };
};

export type CloudStatus = {
  enabled: boolean;
  connected: boolean;
  id?: string;
  roundtripMs?: number;
};

export type HTTPStatus = {
  enabled: boolean;
  listening: boolean;
  address: {
    port: number;
    family: string;
    address: string;
  };
};

export type MIDIStatus = {
  enabled: boolean;
  devices: MIDIDeviceInfo[];
};

export type MIDIDeviceInfo = {
  type: string;
  name: string;
};

export type MQTTStatus = {
  enabled: boolean;
  connected: boolean;
  broker: string;
};

export type TCPStatus = {
  enabled: boolean;
  listening: boolean;
  address: {
    port: number;
    family: string;
    address: string;
  };
};

export type UDPStatus = {
  enabled: boolean;
  listening: boolean;
  address: {
    port: number;
    family: string;
    address: string;
  };
};
