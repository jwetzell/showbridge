import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-import-config',
  templateUrl: './import-config.component.html',
  styleUrls: ['./import-config.component.css'],
})
export class ImportConfigComponent {
  formGroup?: FormGroup;

  constructor(
    private schemaService: SchemaService,
    public dialogRef: MatDialogRef<ImportConfigComponent>
  ) {
    if (schemaService.schema) {
      this.formGroup = new FormGroup({
        config: new FormControl(null, [Validators.required, schemaService.configValidator(this.schemaService.schema)]),
      });
    }
  }

  importConfig() {
    if (this.formGroup?.valid) {
      this.dialogRef.close(JSON.parse(this.formGroup.controls['config'].value));
    }
  }
}
