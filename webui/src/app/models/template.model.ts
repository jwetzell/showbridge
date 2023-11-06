import { CopyObject } from './copy-object.model';

export type GenericTemplateObject<T> = {
  id?: number;
  object: T;
  description?: string;
  tags?: string;
};

export type TemplateObject = CopyObject & {
  id?: number;
  description?: string;
  tags?: string;
};
