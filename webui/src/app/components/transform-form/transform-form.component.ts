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

  schema: any;
  transformFormGroup: FormGroup = new FormGroup({
    type: new FormControl(''),
    enabled: new FormControl(true),
  });

  constructor(private schemaService: SchemaService) {}

  ngOnInit(): void {
    if (this.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Transform', this.type);

      if (this.data && this.transformFormGroup) {
        this.transformFormGroup.patchValue(this.data);
      }

      this.transformFormGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });
    }
  }

  formUpdated() {
    this.updated.emit({
      ...this.transformFormGroup.value,
    });
  }

  paramsUpdated(params: any) {
    this.updated.emit({ ...this.transformFormGroup.value, params });
  }

  getType(): string {
    return this.transformFormGroup?.controls['type'].value;
  }
}
