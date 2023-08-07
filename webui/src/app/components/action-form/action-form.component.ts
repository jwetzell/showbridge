import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Action } from 'src/app/models/action.model';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-action-form',
  templateUrl: './action-form.component.html',
  styleUrls: ['./action-form.component.css'],
})
export class ActionFormComponent implements OnInit {
  @Input() type?: string;
  @Input() data?: Action;
  @Output() updated: EventEmitter<Action> = new EventEmitter<Action>();

  paramsSchema: any;
  schema: any;
  actionFormGroup: FormGroup = new FormGroup({
    type: new FormControl('log'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });
  paramsFormGroup: FormGroup = new FormGroup({});

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Action', this.type);

      this.paramsSchema = this.schemaService.getParamsForObjectType('Action', this.type);
      if (this.paramsSchema) {
        this.paramsFormGroup = this.schemaService.getFormGroupFromSchema(this.paramsSchema);
      } else {
        console.error(`transform-form: no params schema found for ${this.type}`);
      }

      if (this.data && this.actionFormGroup) {
        this.actionFormGroup.patchValue(this.data);

        if (this.data.params && this.paramsFormGroup) {
          this.paramsFormGroup.patchValue(this.data.params);
        }
      }

      this.actionFormGroup.valueChanges.subscribe((value) => {
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
      ...this.actionFormGroup.value,
      params,
    });
  }

  paramKeys() {
    return Object.keys(this.paramsFormGroup.controls);
  }

  getType(): string {
    return this.actionFormGroup?.controls['type'].value;
  }
}
