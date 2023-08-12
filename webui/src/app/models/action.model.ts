import { Transform } from './transform.model';

export interface Action {
  type: string;
  comment?: string;
  params?: {
    [key: string]: any;
  };
  transforms?: Transform[];
  enabled: boolean;
}
