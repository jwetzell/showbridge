import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import Ajv, { JSONSchemaType } from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { noop, sortBy } from 'lodash-es';
import { Action } from '../models/action.model';
import { ConfigFile } from '../models/config.models';
import { ObjectInfo, ParamsFormInfo } from '../models/form.model';
import { Trigger } from '../models/trigger.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  schemaUrl?: URL;
  schema?: JSONSchemaType<ConfigFile>;

  ajv: Ajv = new Ajv({ allErrors: true });

  actionTypes: ObjectInfo[] = [];
  transformTypes: ObjectInfo[] = [];
  triggerTypes: ObjectInfo[] = [];
  protocolTypes: ObjectInfo[] = [];

  errorPaths: string[] = [];

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    settingsService.schemaUrl.subscribe((url) => {
      console.log(`schema url: ${url.toString()}`);
      this.schemaUrl = url;
      this.loadSchema();
    });
  }

  loadSchema() {
    if (this.schemaUrl) {
      this.http.get<JSONSchemaType<ConfigFile>>(this.schemaUrl.toString()).subscribe((schema) => {
        this.setSchema(schema);
      });
    } else {
      throw new Error('schema: no schema url set');
    }
  }

  validate(data: any): boolean {
    if (this.schema && this.ajv) {
      this.ajv.validate('Config', data);
      if (this.ajv.errors) {
        console.error(this.ajv.errors);
        const errorPaths = new Set(
          this.ajv.errors.map((error) => {
            const errorPathMatch = error.instancePath.match(/(\/.*)\d+/);
            if (errorPathMatch) {
              return errorPathMatch[0].substring(1).replaceAll('/params', '');
            }
            return '';
          })
        );
        this.errorPaths = Array.from(errorPaths);
        return false;
      } else {
        this.errorPaths = [];
      }
    }
    return true;
  }

  getSkeletonForAction(actionType: string): Action {
    const template: Action = {
      type: actionType,
      transforms: [],
      enabled: true,
    };
    const itemInfo = this.actionTypes.find((itemInfo) => itemInfo.type === actionType);
    if (itemInfo?.schema?.required && itemInfo.schema.required.includes('params')) {
      template.params = this.getSkeletonForParamsSchema(itemInfo.schema.properties.params);
    }
    return template;
  }

  getSkeletonForTrigger(triggerType: string): Trigger {
    const template: Trigger = {
      type: triggerType,
      actions: [],
      subTriggers: [],
      enabled: true,
    };
    const itemInfo = this.triggerTypes.find((itemInfo) => itemInfo.type === triggerType);
    if (itemInfo?.schema?.required && itemInfo.schema.required.includes('params')) {
      template.params = this.getSkeletonForParamsSchema(itemInfo.schema.properties.params);
    }
    return template;
  }

  getSkeletonForTransform(transformType: string): Trigger {
    const template: Trigger = {
      type: transformType,
      enabled: true,
    };
    const itemInfo = this.transformTypes.find((itemInfo) => itemInfo.type === transformType);
    if (itemInfo?.schema?.required && itemInfo.schema.required.includes('params')) {
      template.params = this.getSkeletonForParamsSchema(itemInfo.schema.properties.params);
    }
    return template;
  }

  getSkeletonForParamsSchema(paramsSchema: SomeJSONSchema): { [key: string]: any } {
    const paramsTemplate = {};
    // TODO(jwetzell): make a smart version of this populating fields with defaults
    return paramsTemplate;
  }

  setSchema(schema: JSONSchemaType<ConfigFile>) {
    this.schema = schema;

    if (this.ajv.getSchema('Config') !== undefined) {
      this.ajv.removeSchema('Config');
    }
    this.actionTypes = [];
    this.transformTypes = [];
    this.triggerTypes = [];
    this.protocolTypes = [];

    this.ajv.addSchema(schema);

    this.populateActionTypes();
    this.populateTransformTypes();
    this.populateTriggerTypes();
    this.populateProtocolTypes();
  }

  populateProtocolTypes() {
    if (this.schema?.properties) {
      const protocolKeys = Object.keys(this.schema.properties);
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
        this.actionTypes = sortBy(
          Object.keys(definitions)
            .filter((definitionKey) => definitionKey.startsWith('Action'))
            .map((definitionKey) => definitions[definitionKey])
            .filter((definition) => definition.properties?.type?.const !== undefined)
            .map((definition) => {
              return {
                name: definition['title'],
                type: definition.properties?.type?.const,
                schema: definition,
              };
            }),
          ['name']
        );
      }
    }
  }

  populateTransformTypes() {
    if (this.schema) {
      const definitions = this.schema.definitions;
      if (definitions) {
        this.transformTypes = sortBy(
          Object.keys(definitions)
            .filter((definitionKey) => definitionKey.startsWith('Transform'))
            .map((definitionKey) => definitions[definitionKey])
            .filter((definition) => definition.properties?.type?.const !== undefined)
            .map((definition) => {
              return {
                name: definition['title'],
                type: definition.properties?.type?.const,
                schema: definition,
              };
            }),
          ['name']
        );
      }
    }
  }

  populateTriggerTypes() {
    if (this.schema) {
      const definitions = this.schema.definitions;
      if (definitions) {
        this.triggerTypes = sortBy(
          Object.keys(definitions)
            .filter((definitionKey) => definitionKey.startsWith('Trigger'))
            .map((definitionKey) => definitions[definitionKey])
            .filter((definition) => definition.properties?.type?.const !== undefined)
            .map((definition) => {
              return {
                name: definition['title'],
                type: definition.properties?.type?.const,
                schema: definition,
              };
            }),
          ['name']
        );
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
      const paramKeys = Object.keys(schema.properties);
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

              paramsFormInfo.paramsInfo[paramKey] = {
                key: paramKey,
                display: paramSchema.title ? paramSchema.title : paramKey,
                type: paramSchema.type,
                hint: paramSchema.description,
                isConst: !!paramSchema.const,
                isTemplated: paramKey.startsWith('_'),
                canTemplate: paramKeys.includes(`_${paramKey}`),
                schema: paramSchema,
                placeholder: '',
              };

              if (paramSchema.examples && paramSchema.examples.length > 0) {
                paramsFormInfo.paramsInfo[paramKey].placeholder = paramSchema.examples[0];
              }

              if (paramSchema.type === 'array') {
                if (paramSchema.$ref === '#/definitions/ActionList') {
                  validators.push(this.subActionValidator);
                }
              }

              if (paramSchema.type === 'object') {
                validators.push(this.objectValidator);
              }

              //TODO(jwetzell): figure out how to disable a control but not have to deal with undefined values on disabled controls
              paramsFormInfo.formGroup.addControl(paramKey, new FormControl(formDefault, validators));

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

  cleanArray(values: any[], itemSchema: SomeJSONSchema) {
    if (Array.isArray(values)) {
      switch (itemSchema.type) {
        case 'number':
          return values.map(Number.parseFloat);
        case 'integer':
          return values.map(Number.parseInt);
        case 'string':
          return values;
        case 'object':
          return values;
        default:
          console.error(`schema-service: unsupported array type ${itemSchema.type}`);
          return values;
      }
    }
    return [];
  }

  cleanParams(paramsSchema: SomeJSONSchema, params: any, keysToTemplate: Set<string>): any {
    Object.keys(params).forEach((paramKey) => {
      if (paramsSchema.properties[paramKey]) {
        const paramSchema = paramsSchema.properties[paramKey];

        // delete null/undefined/empty params that aren't required
        if (params[paramKey] === undefined || params[paramKey] === null || params[paramKey] === '') {
          if (paramSchema.required) {
            if (!paramSchema.includes(paramKey)) {
              delete params[paramKey];
              return;
            }
          } else {
            delete params[paramKey];
            return;
          }
        }

        // NOTE(jwetzell): delete template looking keys that should not be
        if (paramKey.startsWith('_') && !keysToTemplate.has(paramKey.substring(1))) {
          delete params[paramKey];
          return;
        }

        // NOTE(jwetzell): delete regular keys that are marked as being templated
        if (keysToTemplate.has(paramKey)) {
          delete params[paramKey];
          return;
        }

        if (paramSchema.type) {
          switch (paramSchema.type) {
            case 'integer':
              var paramValue = parseInt(params[paramKey]);
              // NOTE(jwetzell): delete non-numbers
              if (Number.isNaN(paramValue)) {
                delete params[paramKey];
              } else {
                params[paramKey] = paramValue;
              }
              break;
            case 'number':
              var paramValue = parseFloat(params[paramKey]);
              // NOTE(jwetzell): delete non-numbers
              if (Number.isNaN(paramValue)) {
                delete params[paramKey];
              } else {
                params[paramKey] = paramValue;
              }
              break;
            case 'array':
              if (!Array.isArray(params[paramKey])) {
                const paramValue = params[paramKey];
                params[paramKey] = this.parseStringToArray(paramValue, paramSchema);
              }
              break;
            case 'object':
              try {
                params[paramKey] = JSON.parse(params[paramKey]);
              } catch (error) {
                noop();
              }
              break;
            case 'string':
              noop();
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

  parseStringToArray(value: any, schema: SomeJSONSchema): any[] | undefined {
    if (!Array.isArray(value)) {
      const paramValue = value;
      if (paramValue === undefined || paramValue.trim().length === 0) {
        value = [];
      } else {
        if (schema.items?.type) {
          if (schema.items?.type === 'integer') {
            return paramValue
              .split(',')
              .map((part: string) => part.trim())
              .map((item: any) => parseInt(item));
          } else if (schema.items?.type === 'number') {
            return paramValue
              .split(',')
              .map((part: string) => part.trim())
              .map((item: any) => parseFloat(item));
          } else if (schema.items?.type === 'string') {
            return paramValue.split(',').map((part: string) => part.trim());
          } else {
            console.error(`schema-service: unhandled array schema type: ${schema.items?.type}`);
          }
        } else if (schema['$ref'] === '#/definitions/ActionList') {
          try {
            return JSON.parse(`[${paramValue}]`);
          } catch (error) {
            noop();
          }
        } else {
          // NOTE(jwetzell): default to comma-separated strings
          return paramValue.split(',').map((part: string) => part.trim());
        }
      }
    }
    return undefined;
  }

  getObjectTypeFromObject(object: any) {
    if (object !== undefined && object.type !== undefined && object.enabled !== undefined) {
      const matchedAction = this.actionTypes.find((actionType) => object.type === actionType.type);
      if (matchedAction !== undefined) {
        return 'Action';
      }

      const matchedTrigger = this.triggerTypes.find((triggerType) => object.type === triggerType.type);
      if (matchedTrigger !== undefined) {
        return 'Trigger';
      }

      const matchedTransform = this.transformTypes.find((transformType) => object.type === transformType.type);
      if (matchedTransform !== undefined) {
        return 'Transform';
      }
    }
    return undefined;
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

  configValidator(validateSchema: JSONSchemaType<ConfigFile>) {
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
