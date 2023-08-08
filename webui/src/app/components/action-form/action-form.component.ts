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

  schema: any;
  actionFormGroup: FormGroup = new FormGroup({
    type: new FormControl('log'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Action', this.type);

      if (this.data && this.actionFormGroup) {
        this.actionFormGroup.patchValue(this.data);
      }

      this.actionFormGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });
    }
  }

  formUpdated() {
    this.updated.emit({
      ...this.actionFormGroup.value,
    });
  }

  paramsUpdated(params: any) {
    this.updated.emit({ ...this.actionFormGroup.value, params });
  }

  getType(): string {
    return this.actionFormGroup?.controls['type'].value;
  }
}
