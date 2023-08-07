import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { JSONSchemaType } from 'ajv';
import { Action } from '../models/action.model';
import { ConfigFileSchema, ProtocolConfiguration } from '../models/config.models';
import { Transform } from '../models/transform.model';
import { Trigger } from '../models/trigger.model';

@Injectable({
  providedIn: 'root',
})
export class FormGroupService {
  schema?: JSONSchemaType<ConfigFileSchema>;

  constructor() {}

  setSchema(schema: JSONSchemaType<ConfigFileSchema>) {
    this.schema = schema;
  }

  getParamsForObjectType(objectType: string, type: string) {
    if (this.schema) {
      const definitions = this.schema.definitions;
      if (definitions) {
        const definition = Object.keys(definitions)
          .filter((definitionKey) => definitionKey.startsWith(objectType))
          .map((definitionKey) => {
            return definitions[definitionKey];
          })
          .find((definition) => definition.properties?.type?.const === type);
        return definition?.properties.params;
      }
    } else {
      console.error('schema is null');
    }
  }

  getParamsForProtocol(protocol: string) {
    if (this.schema) {
      if (this.schema.properties[protocol]) {
        return this.schema.properties.protocol;
      }
    } else {
      console.error('schema is null');
    }
  }

  getProtocolFormGroup(protocolType: string, protocol: ProtocolConfiguration): FormGroup {
    const formGroup = new FormGroup({
      params: new FormGroup({}),
      triggers: new FormArray([]),
    });

    const triggers = formGroup.get('triggers') as FormArray;
    protocol.triggers?.forEach((trigger: Trigger) => {
      triggers.push(this.getTriggerFormGroup(trigger));
    });

    if (protocol?.params) {
      Object.keys(protocol?.params).forEach((paramKey) => {
        if (!formGroup.controls['params'].get(paramKey)) {
          const paramsFormGroup = formGroup.controls['params'] as FormGroup;

          paramsFormGroup.addControl(paramKey, new FormControl(''));
        }
      });
    } else {
      formGroup.controls.params.disable();
    }

    return formGroup;
  }

  getTriggerFormGroup(trigger: Trigger): FormGroup {
    const formGroup = new FormGroup({
      type: new FormControl(''),
      params: new FormGroup({}),
      actions: new FormArray([]),
      enabled: new FormControl(false),
    });

    const actions = formGroup.get('actions') as FormArray;
    trigger.actions?.forEach((action: Action) => {
      actions.push(this.getActionFormGroup(action));
    });

    if (trigger?.params) {
      Object.keys(trigger?.params).forEach((paramKey) => {
        if (!formGroup.controls['params'].get(paramKey)) {
          const paramsFormGroup = formGroup.controls['params'] as FormGroup;

          paramsFormGroup.addControl(paramKey, new FormControl(''));
        }
      });
    } else {
      formGroup.controls.params.disable();
    }

    return formGroup;
  }

  getActionFormGroup(action: Action): FormGroup {
    const formGroup = new FormGroup({
      type: new FormControl(''),
      params: new FormGroup({}),
      transforms: new FormArray([]),
      enabled: new FormControl(false),
    });

    const transforms = formGroup.get('transforms') as FormArray;
    action?.transforms?.forEach((transform: Transform) => {
      transforms.push(this.getTransformFormGroup(transform));
    });

    if (action?.params) {
      const paramsFormGroup = formGroup.controls['params'] as FormGroup;

      Object.keys(action?.params).forEach((paramKey) => {
        if (!formGroup.controls['params'].get(paramKey)) {
          paramsFormGroup.addControl(paramKey, new FormControl(''));
        }
      });
    } else {
      formGroup.controls.params.disable();
    }

    return formGroup;
  }

  getTransformFormGroup(transform: Transform): FormGroup {
    const formGroup = new FormGroup({
      type: new FormControl(''),
      params: new FormGroup({}),
      enabled: new FormControl(false),
    });

    if (transform?.params) {
      Object.keys(transform?.params).forEach((paramKey) => {
        if (!formGroup.controls['params'].get(paramKey)) {
          const paramsFormGroup = formGroup.controls['params'] as FormGroup;
          paramsFormGroup.addControl(paramKey, new FormControl(''));
        }
      });
    } else {
      formGroup.controls.params.disable();
    }

    return formGroup;
  }
}
