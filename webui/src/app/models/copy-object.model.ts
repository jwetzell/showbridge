import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

export type TriggerCopyObject = {
  type: 'Trigger';
  object: Trigger | Trigger[];
};

export type ActionCopyObject = {
  type: 'Action';
  object: Action | Action[];
};

export type TransformCopyObject = {
  type: 'Transform';
  object: Transform | Transform[];
};

export type CopyObject = TriggerCopyObject | TransformCopyObject | ActionCopyObject;
