import { ActionObj } from './action';
import { ActionParams, TriggerParams } from './params';

export type TriggerObj<T> = {
  type: string;
  params?: T;
  enabled: boolean;
  comment?: string;
  actions: ActionObj<ActionParams>[];
  subTriggers: TriggerObj<TriggerParams>[];
};
