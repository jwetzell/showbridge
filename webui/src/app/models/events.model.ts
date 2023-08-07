import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

export interface MessageEventData {
  messageType: string;
  data: {
    [key: string]: any;
  };
}

export interface TriggerEventData {
  messageType: string;
  data: {
    path: string;
    fired: boolean;
    trigger: Trigger;
  };
}

export interface ActionEventData {
  messageType: string;
  data: {
    path: string;
    fired: boolean;
    action: Action;
  };
}

export interface TransformEventData {
  messageType: string;
  data: {
    path: string;
    fired: boolean;
    transform: Transform;
  };
}
