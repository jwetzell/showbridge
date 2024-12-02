import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SomeJSONSchema } from 'ajv/dist/types/json-schema';
import { SchemaService } from 'src/app/services/schema.service';

type ImportJSONComponentData = {
  schema?: SomeJSONSchema;
  title: string;
};

@Component({
    selector: 'app-import-json',
    templateUrl: './import-json.component.html',
    styleUrls: ['./import-json.component.css'],
    standalone: false
})
export class ImportJSONComponent {
  readonly data = inject<ImportJSONComponentData>(MAT_DIALOG_DATA);

  formGroup?: FormGroup;

  constructor(
    private schemaService: SchemaService,
    public dialogRef: MatDialogRef<ImportJSONComponent>
  ) {
    if (this.data.schema !== undefined) {
      console.log(this.data.schema);
      this.formGroup = new FormGroup({
        json: new FormControl(null, [
          Validators.required,
          this.isJSON,
          this.schemaService.jsonValidator(this.data.schema),
        ]),
      });
    } else {
      this.formGroup = new FormGroup({
        json: new FormControl(null, [Validators.required, this.isJSON]),
      });
    }

    this.formGroup.valueChanges.subscribe(console.log);
  }

  isJSON(control: AbstractControl): ValidationErrors | null {
    console.log(control);
    try {
      JSON.parse(control.value);
      return null;
    } catch (error) {
      return { json: error };
    }
  }

  importJson() {
    if (this.formGroup?.valid) {
      this.dialogRef.close(JSON.parse(this.formGroup.controls['json'].value));
    }
  }
}
