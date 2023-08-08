import { FormGroup } from '@angular/forms';

export interface ItemInfo {
  name: string;
  type: string;
}
export interface ParamsFormInfo {
  formGroup: FormGroup;
  paramsInfo: {
    [key: string]: {
      display: string;
      hint: string;
      type: string;
    };
  };
}
