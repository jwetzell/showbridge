import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

export interface MessageEventData {
  eventType: 'message';
  data: {
    [key: string]: any;
  };
}

export interface TriggerEventData {
  eventType: 'trigger';
  data: {
    path: string;
    fired: boolean;
    trigger: Trigger;
  };
}

export interface ActionEventData {
  eventType: 'action';
  data: {
    path: string;
    fired: boolean;
    action: Action;
  };
}

export interface TransformEventData {
  eventType: 'transform';
  data: {
    path: string;
    fired: boolean;
    transform: Transform;
  };
}

export interface ProtocolStatusEventData {
  eventType: 'protocol_status';
  data: {
    cloud: CloudStatus;
    mqtt: MQTTStatus;
  };
}

export interface CloudStatus {
  connected: boolean;
  id?: string;
}

export interface MQTTStatus {
  connected: boolean;
}
