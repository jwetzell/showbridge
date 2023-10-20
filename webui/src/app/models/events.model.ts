import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

export type MessageEventData = {
  eventType: 'messageIn';
  data: {
    type: string;
  };
};

export type TriggerEventData = {
  eventType: 'trigger';
  data: {
    path: string;
    fired: boolean;
    trigger: Trigger;
  };
};

export type ActionEventData = {
  eventType: 'action';
  data: {
    path: string;
    fired: boolean;
    action: Action;
  };
};

export type TransformEventData = {
  eventType: 'transform';
  data: {
    path: string;
    fired: boolean;
    transform: Transform;
  };
};

export type ProtocolStatusEventData = {
  eventType: 'protoclStatus';
  data: {
    cloud: CloudStatus;
    mqtt: MQTTStatus;
    midi: MIDIStatus;
  };
};

export type CloudStatus = {
  connected: boolean;
  id?: string;
};

export type MQTTStatus = {
  connected: boolean;
};

export type MIDIStatus = {
  devices: MIDIDeviceInfo[];
};

export type MIDIDeviceInfo = {
  type: string;
  name: string;
};
