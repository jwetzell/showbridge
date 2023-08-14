import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { Action } from 'src/app/models/action.model';
import { Transform } from 'src/app/models/transform.model';
import { Trigger } from 'src/app/models/trigger.model';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-object-form',
  templateUrl: './object-form.component.html',
  styleUrls: ['./object-form.component.css'],
})
export class ObjectFormComponent {
  @Input() schema?: any;
  @Input() data?: Trigger | Action | Transform;
  @Output() updated: EventEmitter<Trigger | Action | Transform> = new EventEmitter<Trigger | Action | Transform>();
  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;

  formGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  constructor(
    private schemaService: SchemaService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.data && this.formGroup) {
      this.formGroup.patchValue(this.data);
    }
    this.formGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  formUpdated() {
    this.updated.emit({
      ...this.formGroup.value,
    });
  }

  paramsUpdated(params: any) {
    this.updated.emit({ ...this.formGroup.value, params });
  }

  getType(): string {
    return this.formGroup?.controls['type'].value;
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }
}
