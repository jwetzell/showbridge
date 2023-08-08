import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ParamsFormInfo } from 'src/app/models/form.model';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-params-form',
  templateUrl: './params-form.component.html',
  styleUrls: ['./params-form.component.css'],
})
export class ParamsFormComponent implements OnInit {
  @Input() parentSchema: any;
  @Input() data?: any;
  @Output() updated: EventEmitter<any> = new EventEmitter<any>();

  paramsSchema: any;
  paramsFormInfo?: ParamsFormInfo;

  paramsOptions: { display: string; paramsFormInfo: ParamsFormInfo; keys: string[]; schema: any }[] = [];
  paramsOptionsSelectedIndex: number = 0;

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    this.paramsSchema = this.parentSchema.properties?.params;
    if (this.paramsSchema) {
      if (this.paramsSchema.properties) {
        this.paramsFormInfo = this.schemaService.getFormGroupFromParamsSchema(this.paramsSchema);
      } else if (this.paramsSchema.oneOf) {
        this.paramsOptions = this.paramsSchema.oneOf.map((oneOf: any) => {
          const paramsOption = {
            display: oneOf.title,
            schema: oneOf,
            paramsFormInfo: this.schemaService.getFormGroupFromParamsSchema(oneOf),
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
      this.paramsFormInfo.formGroup.patchValue(this.data);
    }

    this.paramsFormInfo?.formGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  paramsOptionsTabSelected(event: MatTabChangeEvent) {
    // TODO(jwetzell): figure out how to handle params properties that have const requirements when switching tabs
    const paramsOption = this.paramsOptions[event.index];

    this.paramsSchema = paramsOption.schema;
    this.paramsFormInfo = paramsOption.paramsFormInfo;

    // NOTE(jwetzell): prune params that MUST change from the data when switch paramOptions
    Object.entries(this.paramsFormInfo.paramsInfo).forEach(([paramKey, paramInfo]) => {
      if (paramInfo.const) {
        if (this.data[paramKey]) {
          delete this.data[paramKey];
        }
      }
    });

    if (this.data && this.paramsFormInfo.formGroup) {
      this.paramsFormInfo.formGroup.patchValue(this.data);
    }

    this.paramsFormInfo.formGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  formUpdated() {
    const params = this.schemaService.cleanParams(this.paramsSchema, this.paramsFormInfo?.formGroup.value);
    this.updated.emit(params);
  }

  paramKeys() {
    if (this.paramsFormInfo) {
      return Object.keys(this.paramsFormInfo?.formGroup.controls);
    }
    return [];
  }
}
