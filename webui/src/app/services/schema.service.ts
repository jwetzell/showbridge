import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import Ajv, { ErrorObject, JSONSchemaType } from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { noop } from 'lodash';
import { Action } from '../models/action.model';
import { ConfigFileSchema } from '../models/config.models';
import { ObjectInfo, ParamsFormInfo } from '../models/form.model';
import { Trigger } from '../models/trigger.model';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  schemaUrl: string = '/config/schema';
  schema?: JSONSchemaType<ConfigFileSchema>;

  isDummySite: boolean = false;

  ajv: Ajv = new Ajv();

  actionTypes: ObjectInfo[] = [];
  transformTypes: ObjectInfo[] = [];
  triggerTypes: ObjectInfo[] = [];
  protocolTypes: ObjectInfo[] = [];

  constructor(private http: HttpClient) {}

  loadSchema() {
    this.http.get<JSONSchemaType<ConfigFileSchema>>(this.schemaUrl).subscribe((schema) => {
      this.setSchema(schema);
    });
  }

  validate(data: any): (string | undefined)[] {
    if (this.schema && this.ajv) {
      this.ajv.validate('Config', data);
      if (this.ajv.errors) {
        return this.ajv.errors
          .filter((errorRecord) => errorRecord.message !== undefined)
          .map((errorRecord) => errorRecord.message);
      }
    }
    return [];
  }

  getErrorMessagesFromAjvErrors(): ErrorObject<string, Record<string, any>, unknown>[] {
    if (this.ajv.errors && this.schema) {
      console.log(this.ajv.errors);
    }
    if (this.ajv.errors === null || this.ajv.errors === undefined) {
      return [];
    }
    return this.ajv.errors;
  }

  getTemplateForAction(actionType: string): Action {
    const template: Action = {
      type: actionType,
      transforms: [],
      enabled: true,
    };
    const itemInfo = this.actionTypes.find((itemInfo) => itemInfo.type === actionType);
    if (itemInfo?.schema?.required && itemInfo.schema.required.includes('params')) {
      template.params = this.getTemplateForParamsSchema(itemInfo.schema.properties.params);
    }
    return template;
  }

  getTemplateForTrigger(triggerType: string): Trigger {
    const template: Trigger = {
      type: triggerType,
      actions: [],
      enabled: true,
    };
    const itemInfo = this.triggerTypes.find((itemInfo) => itemInfo.type === triggerType);
    if (itemInfo?.schema?.required && itemInfo.schema.required.includes('params')) {
      template.params = this.getTemplateForParamsSchema(itemInfo.schema.properties.params);
    }
    return template;
  }

  getTemplateForTransform(transformType: string): Trigger {
    const template: Trigger = {
      type: transformType,
      enabled: true,
    };
    const itemInfo = this.transformTypes.find((itemInfo) => itemInfo.type === transformType);
    if (itemInfo?.schema?.required && itemInfo.schema.required.includes('params')) {
      template.params = this.getTemplateForParamsSchema(itemInfo.schema.properties.params);
    }
    return template;
  }

  getTemplateForParamsSchema(paramsSchema: SomeJSONSchema): { [key: string]: any } {
    const paramsTemplate = {};
    // TODO(jwetzell): make a smart version of this populating fields with defaults
    return paramsTemplate;
  }

  setupForDummySite() {
    this.schemaUrl = '/config.schema.json';
    this.isDummySite = true;
  }

  setSchema(schema: JSONSchemaType<ConfigFileSchema>) {
    this.schema = schema;

    this.ajv.addSchema(schema);

    this.populateActionTypes();
    this.populateTransformTypes();
    this.populateTriggerTypes();
    this.populateProtocolTypes();
  }

  populateProtocolTypes() {
    if (this.schema?.properties) {
      const protocolKeys = Object.keys(this.schema.properties);
      // protocolKeys.sort();
      protocolKeys.forEach((protocolKey) => {
        const protocolSchema = this.schema?.properties[protocolKey];
        if (protocolSchema) {
          this.protocolTypes.push({
            name: protocolSchema.title,
            type: protocolKey,
            schema: this.schema?.properties[protocolKey],
          });
        }
      });
    }
  }

  populateActionTypes() {
    if (this.schema) {
      const definitions = this.schema.definitions;
      if (definitions) {
        this.actionTypes = Object.keys(definitions)
          .filter((definitionKey) => definitionKey.startsWith('Action'))
          .map((definitionKey) => definitions[definitionKey])
          .filter((definition) => definition.properties?.type?.const !== undefined)
          .map((definition) => {
            return {
              name: definition['title'],
              type: definition.properties?.type?.const,
              schema: definition,
            };
          });
      }
    }
  }

  populateTransformTypes() {
    if (this.schema) {
      const definitions = this.schema.definitions;
      if (definitions) {
        this.transformTypes = Object.keys(definitions)
          .filter((definitionKey) => definitionKey.startsWith('Transform'))
          .map((definitionKey) => definitions[definitionKey])
          .filter((definition) => definition.properties?.type?.const !== undefined)
          .map((definition) => {
            return {
              name: definition['title'],
              type: definition.properties?.type?.const,
              schema: definition,
            };
          });
      }
    }
  }

  populateTriggerTypes() {
    if (this.schema) {
      const definitions = this.schema.definitions;
      if (definitions) {
        this.triggerTypes = Object.keys(definitions)
          .filter((definitionKey) => definitionKey.startsWith('Trigger'))
          .map((definitionKey) => definitions[definitionKey])
          .filter((definition) => definition.properties?.type?.const !== undefined)
          .map((definition) => {
            return {
              name: definition['title'],
              type: definition.properties?.type?.const,
              schema: definition,
            };
          });
      }
    }
  }

  getSchemaForObjectType(objectType: string, type: string) {
    if (this.schema) {
      const definitions = this.schema.definitions;
      if (definitions) {
        const definition = Object.keys(definitions)
          .filter((definitionKey) => definitionKey.startsWith(objectType))
          .map((definitionKey) => {
            return definitions[definitionKey];
          })
          .find((definition) => definition.properties?.type?.const === type);
        return definition;
      }
    } else {
      console.error('schema is null');
    }
    return undefined;
  }

  getSchemaForProtocol(protocolType: string) {
    if (this.schema) {
      const schemaProperties = this.schema.properties;
      if (schemaProperties) {
        const protocolSchema = schemaProperties[protocolType];

        return protocolSchema;
      }
    } else {
      console.error('schema is null');
    }
    return undefined;
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

  matchParamsDataToSchema(data: any, schemas: SomeJSONSchema[]) {
    const matchingSchemaIndex = schemas.findIndex((schema) => {
      return this.ajv.validate(schema, data);
    });
    if (matchingSchemaIndex >= 0) {
      return matchingSchemaIndex;
    }
    return 0;
  }

  getFormInfoFromParamsSchema(schema: SomeJSONSchema): ParamsFormInfo {
    const paramsFormInfo: ParamsFormInfo = {
      formGroup: new FormGroup({}),
      paramsInfo: {},
    };
    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([paramKey, paramSchema]: [string, any]) => {
        if (paramSchema.type) {
          switch (paramSchema.type) {
            case 'string':
            case 'number':
            case 'integer':
            case 'boolean':
            case 'array': // TODO(jwetzell): actually handle arrays
            case 'object': // TODO(jwetzell): actually handle objects
              let formDefault = '';
              const validators: ValidatorFn[] = [];

              // NOTE(jwetzell): check for a default value to set
              if (paramSchema.const) {
                formDefault = paramSchema.const;
              } else if (paramSchema.default) {
                formDefault = paramSchema.default;
              }

              // NOTE(jwetzell): add as many validators as we can

              if (paramSchema.minimum) {
                validators.push(Validators.min(paramSchema.minimum));
              }

              if (paramSchema.maximum) {
                validators.push(Validators.max(paramSchema.maximum));
              }

              if (paramSchema.pattern) {
                validators.push(Validators.pattern(new RegExp(paramSchema.pattern)));
              }

              if (schema.required) {
                if (schema.required.includes(paramKey)) {
                  validators.push(Validators.required);
                }
              }

              if (paramSchema.type === 'object') {
                validators.push(this.objectValidator);
              }

              if (paramSchema.type === 'array') {
                if (paramSchema.$ref === '#/definitions/ActionList') {
                  validators.push(this.subActionValidator);
                }
              }
              paramsFormInfo.formGroup.addControl(paramKey, new FormControl(formDefault, validators));
              paramsFormInfo.paramsInfo[paramKey] = {
                display: paramKey,
                type: paramSchema.type,
                hint: paramSchema.description,
                const: !!paramSchema.const,
                schema: paramSchema,
              };

              if (paramSchema.enum) {
                paramsFormInfo.paramsInfo[paramKey].options = paramSchema.enum;
              }

              break;
            default:
              console.error(`schema-service: unhandled param schema type for form group = ${paramSchema.type}`);
              break;
          }
        } else {
          console.error('schema-service: param property without type');
        }
      });
    } else {
      console.error('trigger-form: params schema without properties');
      console.error(schema);
    }
    return paramsFormInfo;
  }

  cleanParams(paramsSchema: SomeJSONSchema, params: any): any {
    Object.keys(params).forEach((paramKey) => {
      // delete null/undefined params
      if (params[paramKey] === undefined || params[paramKey] === null) {
        delete params[paramKey];
        return;
      }

      if (paramsSchema.properties[paramKey]) {
        const paramSchema = paramsSchema.properties[paramKey];
        if (paramSchema.type) {
          switch (paramSchema.type) {
            case 'integer':
              const paramValue = parseInt(params[paramKey]);
              if (Number.isNaN(paramValue)) {
                delete params[paramKey];
              } else {
                params[paramKey] = parseInt(params[paramKey]);
              }
              break;
            case 'number':
              params[paramKey] = parseFloat(params[paramKey]);
              break;
            case 'array':
              if (!Array.isArray(params[paramKey])) {
                const paramValue = params[paramKey];
                if (paramValue.trim().length === 0) {
                  params[paramKey] = [];
                } else {
                  if (paramSchema?.items?.type) {
                    if (paramSchema?.items?.type === 'integer') {
                      params[paramKey] = paramValue
                        .split(',')
                        .map((part: string) => part.trim())
                        .map((item: any) => parseInt(item));
                    } else if (paramSchema?.items?.type === 'number') {
                      params[paramKey] = paramValue
                        .split(',')
                        .map((part: string) => part.trim())
                        .map((item: any) => parseFloat(item));
                    } else {
                      console.error(`schema-service: unhandled array schema type: ${paramSchema.type}`);
                    }
                  } else if (paramSchema['$ref'] === '#/definitions/ActionList') {
                    try {
                      params[paramKey] = JSON.parse(`[${paramValue}]`);
                    } catch (error) {
                      noop();
                    }
                  }
                }
              }

              break;
            case 'string':
              // NOTE(jwetzell): clean out empty string values that aren't required
              if (params[paramKey] === '') {
                if (paramSchema.required) {
                  if (!paramSchema.includes(paramKey)) {
                    delete params[paramKey];
                  }
                } else {
                  delete params[paramKey];
                }
              }
              break;
            case 'object':
              try {
                params[paramKey] = JSON.parse(params[paramKey]);
              } catch (error) {
                noop();
              }
              break;
            default:
              console.log(`schema-service: unhandled param schema type: ${paramSchema.type}`);
              break;
          }
        }
      }
    });
    return params;
  }

  getTriggerTypesForProtocol(protocolType: string): ObjectInfo[] {
    const types: ObjectInfo[] = [];
    if (!this.schema) {
      return types;
    }

    if (this.schema.properties[protocolType]) {
      const protocolTypeSchema = this.schema.properties[protocolType];
      if (protocolTypeSchema?.properties?.triggers?.items?.oneOf) {
        const validTriggerRefs = protocolTypeSchema.properties.triggers.items.oneOf;
        validTriggerRefs
          .map((triggerRef: any) => triggerRef['$ref'])
          .forEach((triggerRef: string) => {
            if (triggerRef.startsWith('#/definitions/')) {
              triggerRef = triggerRef.replace('#/definitions/', '');
              if (this.schema?.definitions) {
                const triggerSchema = this.schema?.definitions[triggerRef];
                if (triggerSchema) {
                  types.push({
                    name: triggerSchema['title'],
                    type: triggerSchema.properties.type.const,
                    schema: triggerSchema,
                  });
                }
              }
            }
          });
      }
    }

    return types;
  }

  objectValidator(control: AbstractControl): ValidationErrors | null {
    try {
      JSON.parse(control.value);
      return null;
    } catch (error) {
      return { json: true };
    }
  }

  subActionValidator(control: AbstractControl): ValidationErrors | null {
    try {
      JSON.parse(`[${control.value}]`);
      return null;
    } catch (error) {
      return { json: true };
    }
  }

  configValidator(validateSchema: JSONSchemaType<ConfigFileSchema>) {
    return (control: AbstractControl): ValidationErrors | null => {
      try {
        const configObj = JSON.parse(control.value);
        if (this.ajv.validate(validateSchema, configObj)) {
          return null;
        } else {
          return { config: this.ajv.errors };
        }
      } catch (error) {
        return { json: true };
      }
    };
  }
}
