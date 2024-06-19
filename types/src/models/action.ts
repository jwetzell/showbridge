import { TransformParams } from './params';
import { TransformObj } from './transform';

export type ActionObj<T> = {
  type: string;
  params?: T;
  transforms: TransformObj<TransformParams>[];
  enabled: boolean;
  comment?: string;
};
