export type Transform = {
  type: string;
  comment?: string;
  params?: {
    [key: string]: any;
  };
  enabled: boolean;
};
