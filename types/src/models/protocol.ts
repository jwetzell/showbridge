export type ProtocolObj<T> = {
  type: string;
  params?: T;
  enabled: boolean;
  comment?: string;
};
