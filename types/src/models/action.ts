import { TransformObj } from './transform';

export type ActionObj<T> = {
  type: string;
  params: T;
  transforms: TransformObj<unknown>[];
  enabled: boolean;
  comment: string;
};
