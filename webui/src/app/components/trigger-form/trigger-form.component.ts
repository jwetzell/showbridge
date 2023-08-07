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

  schema: any;
  triggerFormGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Trigger', this.type);

      if (this.data && this.triggerFormGroup) {
        this.triggerFormGroup.patchValue(this.data);
      }
      this.triggerFormGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });
    }
  }

  formUpdated() {
    this.updated.emit({
      ...this.triggerFormGroup.value,
    });
  }

  paramsUpdated(params: any) {
    this.updated.emit({ ...this.triggerFormGroup.value, params });
  }

  getType(): string {
    return this.triggerFormGroup?.controls['type'].value;
  }
}
