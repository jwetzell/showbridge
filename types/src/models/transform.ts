export type TransformObj<T> = {
  type: string;
  params: T;
  enabled: boolean;
  comment: string;
};
