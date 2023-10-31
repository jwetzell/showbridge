import { Action } from './action.model';
import { Transform } from './transform.model';
import { Trigger } from './trigger.model';

export type GenericTemplateObject<T> = {
  id?: number;
  object: T;
  description?: string;
  tags?: string;
};

export type TriggerTemplate = GenericTemplateObject<Trigger> & {
  type: 'Trigger';
};

export type ActionTemplate = GenericTemplateObject<Action> & {
  type: 'Action';
};

export type TransformTemplate = GenericTemplateObject<Transform> & {
  type: 'Transform';
};

export type TemplateObject = TriggerTemplate | ActionTemplate | TransformTemplate;
