import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { cloneDeep, has } from 'lodash-es';
import { Subscription } from 'rxjs';
import { ParamsFormInfo } from 'src/app/models/form.model';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-params-form',
  templateUrl: './params-form.component.html',
  styleUrls: ['./params-form.component.css'],
})
export class ParamsFormComponent implements OnInit {
  @Input() parentSchema?: SomeJSONSchema;
  @Input() data?: any;
  @Output() updated: EventEmitter<any> = new EventEmitter<any>();

  paramsSchema?: SomeJSONSchema;
  paramsFormInfo?: ParamsFormInfo;

  formGroupSubscription?: Subscription;
  paramsOptions: { display: string; paramsFormInfo: ParamsFormInfo; keys: string[]; schema: SomeJSONSchema }[] = [];
  paramsOptionsSelectedIndex: number = 0;

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    this.paramsSchema = this.parentSchema?.properties?.params;
    if (this.paramsSchema) {
      if (this.paramsSchema.properties) {
        this.paramsFormInfo = this.schemaService.getFormInfoFromParamsSchema(this.paramsSchema);
      } else if (this.paramsSchema.oneOf) {
        this.paramsOptions = this.paramsSchema.oneOf.map((oneOf: any) => {
          const paramsOption = {
            display: oneOf.title,
            schema: oneOf,
            paramsFormInfo: this.schemaService.getFormInfoFromParamsSchema(oneOf),
          };
          return {
            ...paramsOption,
            keys: Object.keys(paramsOption.paramsFormInfo.formGroup.controls),
          };
        });
        const matchingSchemaIndex = this.schemaService.matchParamsDataToSchema(
          this.data,
          this.paramsOptions.map((paramsOption) => paramsOption.schema)
        );

        this.paramsOptionsSelectedIndex = matchingSchemaIndex;
        this.paramsFormInfo = this.paramsOptions[matchingSchemaIndex].paramsFormInfo;
        this.paramsSchema = this.paramsOptions[matchingSchemaIndex].schema;
      } else {
        console.error('params is not a singular or oneOf');
        console.error(this.parentSchema);
      }
    }

    if (this.data && this.paramsFormInfo?.formGroup) {
      // NOTE(jwetzell): prepare data for form patching
      const dataToPatch = cloneDeep(this.data);
      Object.entries(this.paramsFormInfo.paramsInfo).forEach(([paramKey, paramInfo]) => {
        if (has(dataToPatch, paramKey)) {
          switch (paramInfo.type) {
            case 'object':
              dataToPatch[paramKey] = JSON.stringify(dataToPatch[paramKey]);
              break;
            case 'array':
              dataToPatch[paramKey] = dataToPatch[paramKey]
                .map((item: any) => {
                  switch (typeof item) {
                    case 'object':
                      return JSON.stringify(item);

                    default:
                      return item;
                  }
                })
                .join(',');
              break;
            default:
              break;
          }
        }
      });
      this.paramsFormInfo.formGroup.patchValue(dataToPatch);
    }

    this.formGroupSubscription = this.paramsFormInfo?.formGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  paramsOptionsTabSelected(event: MatTabChangeEvent) {
    // NOTE(jwetzell): no longer interested in the old formGroup valueChanges
    if (this.formGroupSubscription) {
      this.formGroupSubscription.unsubscribe();
    }

    const paramsOption = this.paramsOptions[event.index];

    this.paramsSchema = paramsOption.schema;
    this.paramsFormInfo = paramsOption.paramsFormInfo;

    // NOTE(jwetzell): prune params that MUST change from the data when switch paramOptions
    Object.entries(this.paramsFormInfo.paramsInfo).forEach(([paramKey, paramInfo]) => {
      if (paramInfo.isConst && this.data) {
        if (this.data[paramKey]) {
          delete this.data[paramKey];
        }
      }
    });

    const allowedParamKeys = Object.keys(this.paramsSchema?.properties);
    if (this.data) {
      // NOTE(jwetzell): remove keys that aren't allow in the new params variation
      Object.keys(this.data).forEach((paramKey) => {
        if (allowedParamKeys && !allowedParamKeys.includes(paramKey)) {
          delete this.data[paramKey];
        }
      });
    }

    if (this.paramsFormInfo.formGroup) {
      this.formGroupSubscription = this.paramsFormInfo.formGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });
    }

    if (this.data && this.paramsFormInfo.formGroup) {
      this.paramsFormInfo.formGroup.patchValue(this.data);
    }
  }

  formUpdated() {
    if (this.paramsSchema) {
      const params = this.schemaService.cleanParams(this.paramsSchema, this.paramsFormInfo?.formGroup.value);
      this.updated.emit(params);
    } else {
      console.error('params-form: no paramsSchema loaded');
    }
  }

  paramKeys() {
    if (this.paramsFormInfo) {
      return Object.keys(this.paramsFormInfo?.formGroup.controls);
    }
    return [];
  }
}
