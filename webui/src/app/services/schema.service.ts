import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { JSONSchemaType } from 'ajv';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { ConfigFileSchema } from '../models/config.models';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  schema?: JSONSchemaType<ConfigFileSchema>;

  constructor() {}

  setSchema(schema: JSONSchemaType<ConfigFileSchema>) {
    this.schema = schema;
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

  getFormGroupFromParamsSchema(schema: SomeJSONSchema) {
    const formGroup = new FormGroup({});
    if (schema?.properties) {
      Object.entries(schema.properties).forEach(([paramKey, paramSchema]: [string, any]) => {
        if (paramSchema.const) {
          formGroup.addControl(paramKey, new FormControl(paramSchema.const));
        } else {
          formGroup.addControl(paramKey, new FormControl(undefined));
        }
      });
    } else {
      console.error('trigger-form: params schema without properties');
      console.error(schema);
    }
    return formGroup;
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
              params[paramKey] = parseInt(params[paramKey]);
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
                  params[paramKey] = paramValue.split(',').map((part: string) => part.trim());
                }
              }

              break;
            default:
              console.log(`action-form: unhandled param schema type: ${paramSchema.type}`);
              break;
          }
        }
      }
    });
    return params;
  }
}
