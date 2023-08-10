import { FormGroup } from '@angular/forms';

export interface ItemInfo {
  name: string;
  type: string;
  schema: any;
}
export interface ParamsFormInfo {
  formGroup: FormGroup;
  paramsInfo: ParamsInfo;
}

export interface ParamsInfo {
  [key: string]: {
    display: string;
    hint: string;
    type: string;
    options?: string[];
    const: boolean;
  };
}
