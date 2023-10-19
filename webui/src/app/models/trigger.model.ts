import { Action } from './action.model';

export type Trigger = {
  type: string;
  comment?: string;
  params?: {
    [key: string]: any;
  };
  actions?: Action[];
  subTriggers?: Trigger[];
  enabled: boolean;
};
