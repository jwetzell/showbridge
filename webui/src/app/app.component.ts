import { Component } from '@angular/core';
import Ajv, { JSONSchemaType } from 'ajv';
import { Observable } from 'rxjs';
import { ConfigFileSchema } from './models/config.models';
import { ConfigService } from './services/config.service';
import { EventService } from './services/event.service';
import { SchemaService } from './services/schema.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  config$: Observable<ConfigFileSchema>;

  pendingConfig?: ConfigFileSchema;
  schemaValidator?: Ajv;
  pendingConfigIsValid: Boolean = false;
  schemaLoaded: Boolean = false;

  constructor(
    private configService: ConfigService,
    private eventService: EventService,
    private schemaService: SchemaService
  ) {
    this.config$ = this.configService.getConfig();
    this.configService.getSchema().subscribe((schema) => {
      this.schemaValidator = new Ajv();
      this.schemaValidator.addSchema(schema, 'config');
      this.schemaService.setSchema(schema);
      this.schemaLoaded = true;
      console.log(this.schemaLoaded);
    });
  }

  configUpdated(newConfig: ConfigFileSchema) {
    this.pendingConfig = newConfig;
    this.pendingConfigIsValid = this.validatePendingConfig();
    if (!this.pendingConfigIsValid) {
      console.error(this.schemaValidator?.errors);
    }
  }

  applyConfig() {
    if (this.pendingConfig) {
      this.configService.uploadConfig(this.pendingConfig).subscribe((resp) => {
        this.pendingConfig = undefined;
        this.pendingConfigIsValid = false;
        this.eventService.reload();
      });
    } else {
      console.error('pending config is null');
    }
  }

  validatePendingConfig() {
    if (this.schemaValidator) {
      const valid = this.schemaValidator.validate('config', this.pendingConfig);
      return valid;
    }
    return false;
  }

  getTriggerTypesForMessageType(messageType: string, schema: JSONSchemaType<ConfigFileSchema>): string[] {
    const ajv = new Ajv({
      schemas: [schema],
    });
    const types: string[] = [];

    if (schema.properties[messageType]) {
      const messageTypeSchema = schema.properties[messageType];
      if (messageTypeSchema?.properties?.triggers?.items?.oneOf) {
        const validTriggerRefs = messageTypeSchema.properties.triggers.items.oneOf;
        validTriggerRefs
          .map((triggerRef: any) => triggerRef['$ref'])
          .forEach((triggerRef: string) => {
            if (triggerRef.startsWith('#/definitions/')) {
              triggerRef = triggerRef.replace('#/definitions/', '');
              if (schema.definitions) {
                const triggerSchema = schema?.definitions[triggerRef];
                if (triggerSchema) {
                  types.push(triggerSchema.properties.type.const);
                }
              }
            }
          });
      }
    }

    return types;
  }
}
