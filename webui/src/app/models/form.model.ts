import { FormGroup } from '@angular/forms';

export type ObjectInfo = {
  name: string;
  type: string;
  schema: any;
};

export type ParamsFormInfo = {
  formGroup: FormGroup;
  paramsInfo: ParamsInfo;
};

export type ParamsInfo = {
  [key: string]: ParamInfo;
};

export type ParamInfo = {
  display: string;
  hint: string;
  type: string;
  placeholder?: string;
  options?: string[];
  isTemplated: boolean;
  canTemplate: boolean;
  isConst: boolean;
  schema: any;
};
