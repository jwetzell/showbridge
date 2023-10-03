import { FormGroup } from '@angular/forms';

export interface ObjectInfo {
  name: string;
  type: string;
  schema: any;
}
export interface ParamsFormInfo {
  formGroup: FormGroup;
  paramsInfo: ParamsInfo;
}

export interface ParamsInfo {
  [key: string]: ParamInfo;
}

export interface ParamInfo {
  display: string;
  hint: string;
  type: string;
  placeholder?: string;
  options?: string[];
  isTemplated: boolean;
  canTemplate: boolean;
  isConst: boolean;
  schema: any;
}
