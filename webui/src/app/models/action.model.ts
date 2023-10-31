import { Transform } from './transform.model';

export type Action = {
  type: string;
  comment?: string;
  params?: {
    [key: string]: any;
  };
  transforms?: Transform[];
  enabled: boolean;
};

export type ActionTemplate = {
  id: number;
  action: Action;
  tags?: string;
};
