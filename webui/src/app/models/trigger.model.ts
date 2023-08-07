import { Action } from './action.model';

export interface Trigger {
  type: string;
  params: {
    [key: string]: any;
  };
  actions?: Action[];
  enabled: boolean;
}
