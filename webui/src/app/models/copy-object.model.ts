import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

export interface CopyObject {
  type: 'Trigger' | 'Action' | 'Transform';
  object: Trigger | Action | Transform;
}
