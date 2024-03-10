import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CopyService } from 'src/app/services/copy.service';
import { ImportConfigComponent } from '../import-config/import-config.component';

@Component({
  selector: 'app-clipboard-dialog',
  templateUrl: './clipboard-dialog.component.html',
  styleUrl: './clipboard-dialog.component.css',
})
export class ClipboardDialogComponent {
  formGroup?: FormGroup;

  constructor(
    private copyService: CopyService,
    public dialogRef: MatDialogRef<ImportConfigComponent>
  ) {
    this.formGroup = new FormGroup({
      clipboard: new FormControl(null, [Validators.required, this.jsonValidator()]),
    });
  }

  jsonValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      try {
        const value = JSON.parse(control.value);
        return null;
      } catch (error) {
        console.log(error);
        return { json: true };
      }
    };
  }

  importClipboard() {
    if (this.formGroup?.valid) {
      const jsonSnippet = JSON.parse(this.formGroup.value.clipboard);
      this.copyService.setSnippet(jsonSnippet);
    }
  }
}
