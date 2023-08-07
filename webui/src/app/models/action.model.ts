import { Transform } from './transform.model';

export interface Action {
  type: string;
  params?: {
    [key: string]: any;
  };
  transforms?: Transform[];
  enabled: boolean;
}
