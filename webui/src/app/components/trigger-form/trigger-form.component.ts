import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Trigger } from 'src/app/models/trigger.model';
import { FormGroupService } from 'src/app/services/form-group.service';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-trigger-form',
  templateUrl: './trigger-form.component.html',
  styleUrls: ['./trigger-form.component.css'],
})
export class TriggerFormComponent {
  @Input() type?: string;
  @Input() data?: Trigger;
  @Output() updated: EventEmitter<Trigger> = new EventEmitter<Trigger>();

  paramsSchema: any;
  schema: any;
  triggerFormGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });
  paramsFormGroup: FormGroup = new FormGroup({});

  pendingValue?: Trigger;

  constructor(
    private formGroupService: FormGroupService,
    private schemaService: SchemaService
  ) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Trigger', this.type);

      this.paramsSchema = this.schemaService.getParamsForObjectType('Trigger', this.type);
      if (this.paramsSchema) {
        this.paramsFormGroup = this.schemaService.getFormGroupFromSchema(this.paramsSchema);
      } else {
        console.error(`transform-form: no params schema found for ${this.type}`);
      }

      if (this.data && this.triggerFormGroup) {
        this.triggerFormGroup.patchValue(this.data);
        if (this.data.params && this.paramsFormGroup) {
          this.paramsFormGroup.patchValue(this.data.params);
        }
      }
      this.triggerFormGroup.valueChanges.subscribe((value) => {
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
      ...this.triggerFormGroup.value,
      params,
    });
  }

  paramKeys() {
    return Object.keys(this.paramsFormGroup.controls);
  }

  getType(): string {
    return this.triggerFormGroup?.controls['type'].value;
  }
}
