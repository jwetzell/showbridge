import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

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
    trigger: Trigger;
  };
};

export type ActionEventData = {
  eventName: 'action';
  data: {
    path: string;
    fired: boolean;
    action: Action;
  };
};

export type TransformEventData = {
  eventName: 'transform';
  data: {
    path: string;
    fired: boolean;
    transform: Transform;
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
    ws?: WebSocketStatus;
  };
};

export type CloudStatus = {
  enabled: boolean;
  connected: boolean;
  id?: string;
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

export type WebSocketStatus = {
  enabled: boolean;
  listening: boolean;
};
