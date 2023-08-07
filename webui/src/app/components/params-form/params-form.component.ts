import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
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
  paramsFormGroup: FormGroup = new FormGroup({});

  paramsOptions: { display: string; formGroup: FormGroup; keys: string[]; schema: any }[] = [];
  paramsOptionsSelectedIndex: number = 0;

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    this.paramsSchema = this.parentSchema.properties?.params;
    if (this.paramsSchema) {
      if (this.paramsSchema.properties) {
        this.paramsFormGroup = this.schemaService.getFormGroupFromParamsSchema(this.paramsSchema);
      } else if (this.paramsSchema.oneOf) {
        this.paramsOptions = this.paramsSchema.oneOf.map((oneOf: any) => {
          const paramsOption = {
            display: oneOf.title,
            schema: oneOf,
            formGroup: this.schemaService.getFormGroupFromParamsSchema(oneOf),
          };
          return {
            ...paramsOption,
            keys: Object.keys(paramsOption.formGroup.controls),
          };
        });
        const matchingSchemaIndex = this.schemaService.matchParamsDataToSchema(
          this.data,
          this.paramsOptions.map((paramsOption) => paramsOption.schema)
        );

        this.paramsOptionsSelectedIndex = matchingSchemaIndex;
        this.paramsFormGroup = this.paramsOptions[matchingSchemaIndex].formGroup;
        this.paramsSchema = this.paramsOptions[matchingSchemaIndex].schema;
      } else {
        console.error('params is not a singular or oneOf');
        console.error(this.parentSchema);
      }
    }

    if (this.data && this.paramsFormGroup) {
      this.paramsFormGroup.patchValue(this.data);
    }

    this.paramsFormGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  paramsOptionsTabSelected(event: MatTabChangeEvent) {
    // TODO(jwetzell): figure out how to handle params properties that have const requirements when switching tabs
    const paramsOption = this.paramsOptions[event.index];

    this.paramsSchema = paramsOption.schema;
    this.paramsFormGroup = paramsOption.formGroup;

    if (this.data && this.paramsFormGroup) {
      this.paramsFormGroup.patchValue(this.data);
    }

    this.paramsFormGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  formUpdated() {
    const params = this.schemaService.cleanParams(this.paramsSchema, this.paramsFormGroup.value);
    this.updated.emit(params);
  }

  paramKeys() {
    return Object.keys(this.paramsFormGroup.controls);
  }
}
