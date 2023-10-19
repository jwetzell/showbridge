import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

export type TriggerCopyObject = {
  type: 'Trigger';
  object: Trigger;
};

export type ActionCopyObject = {
  type: 'Action';
  object: Action;
};

export type TransformCopyObject = {
  type: 'Transform';
  object: Transform;
};

export type CopyObject = TriggerCopyObject | TransformCopyObject | ActionCopyObject;
