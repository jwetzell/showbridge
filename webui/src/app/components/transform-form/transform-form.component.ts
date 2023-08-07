import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Transform } from 'src/app/models/transform.model';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-transform-form',
  templateUrl: './transform-form.component.html',
  styleUrls: ['./transform-form.component.css'],
})
export class TransformFormComponent implements OnInit {
  @Input() type?: string;
  @Input() data?: Transform;
  @Output() updated: EventEmitter<Transform> = new EventEmitter<Transform>();

  paramsSchema: any;
  schema: any;
  transformFormGroup: FormGroup = new FormGroup({
    type: new FormControl(''),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });
  paramsFormGroup: FormGroup = new FormGroup({});

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Transform', this.type);

      this.paramsSchema = this.schemaService.getParamsForObjectType('Transform', this.type);
      this.paramsSchema = this.schemaService.getParamsForObjectType('Transform', this.type);
      if (this.paramsSchema?.properties) {
        Object.entries(this.paramsSchema.properties).forEach(([paramKey, paramSchema]) => {
          this.paramsFormGroup.addControl(paramKey, new FormControl(undefined));
        });
      } else {
        console.error('transform-form: params schema without properties');
        console.error(this.schema);
      }

      if (this.data && this.transformFormGroup) {
        this.transformFormGroup.patchValue(this.data);
        if (this.data.params && this.paramsFormGroup) {
          this.paramsFormGroup.patchValue(this.data.params);
        }
      }

      this.transformFormGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });

      this.paramsFormGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });
    }
  }

  formUpdated() {
    const params = this.schemaService.cleanParams(this.paramsSchema, this.paramsFormGroup.value);
    this.updated.emit({
      ...this.transformFormGroup.value,
      params,
    });
  }

  paramKeys() {
    return Object.keys(this.paramsFormGroup.controls);
  }

  getType(): string {
    return this.transformFormGroup?.controls['type'].value;
  }
}
