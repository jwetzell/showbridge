import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import Ajv, { JSONSchemaType } from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { ConfigFileSchema } from '../models/config.models';
import { ItemInfo, ParamsFormInfo } from '../models/form.model';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  schema?: JSONSchemaType<ConfigFileSchema>;
  ajv: Ajv = new Ajv();
  actionTypes: ItemInfo[] = [];
  transformTypes: ItemInfo[] = [];

  constructor() {}

  setSchema(schema: JSONSchemaType<ConfigFileSchema>) {
    this.schema = schema;

    this.populateActionTypes();

    this.populateTransformTypes();
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

  matchParamsDataToSchema(data: any, schemas: any[]) {
    const matchingSchemaIndex = schemas.findIndex((schema) => {
      return this.ajv.validate(schema, data);
    });
    if (matchingSchemaIndex >= 0) {
      return matchingSchemaIndex;
    }
    return 0;
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

  getFormGroupFromParamsSchema(schema: SomeJSONSchema): ParamsFormInfo {
    const paramsFormInfo: ParamsFormInfo = {
      formGroup: new FormGroup({}),
      paramsInfo: {},
    };
    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([paramKey, paramSchema]: [string, any]) => {
        // TODO(jwetzell): handle params that are of array or object type
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
                console.log(paramSchema.pattern);
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
              paramsFormInfo.formGroup.addControl(paramKey, new FormControl(formDefault, validators));
              paramsFormInfo.paramsInfo[paramKey] = {
                display: paramKey,
                type: paramSchema.type,
                hint: paramSchema.description,
                const: !!paramSchema.const,
              };

              if (paramSchema.enum) {
                console.log(paramSchema.enum);
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

  cleanParams(paramsSchema: any, params: any): any {
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
                  let itemsArray = paramValue.split(',').map((part: string) => part.trim());
                  if (paramSchema?.items?.type) {
                    if (paramSchema?.items?.type === 'integer') {
                      itemsArray = itemsArray.map((item: any) => parseInt(item));
                    } else if (paramSchema?.items?.type === 'number') {
                      itemsArray = itemsArray.map((item: any) => parseFloat(item));
                    } else {
                      console.error(`schema-service: unhandled array schema type: ${paramSchema.type}`);
                    }
                  }
                  params[paramKey] = itemsArray;
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
              params[paramKey] = JSON.parse(params[paramKey]);
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

  getTriggerTypesForProtocol(protocolType: string): ItemInfo[] {
    const types: ItemInfo[] = [];
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

  configValidator(validateSchema: any) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!validateSchema) {
        return null;
      }

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
