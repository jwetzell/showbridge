import { ActionObj } from './action';

export type TriggerObj<T> = {
  type: string;
  params?: T;
  enabled: boolean;
  comment?: string;
  actions: ActionObj<unknown>[];
  subTriggers: TriggerObj<unknown>[];
};
