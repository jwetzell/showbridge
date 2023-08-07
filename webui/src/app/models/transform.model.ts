export interface Transform {
  type: string;
  params?: {
    [key: string]: any;
  };
  enabled: boolean;
}
