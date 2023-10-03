import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MIDIStatus } from 'src/app/models/events.model';

@Component({
  selector: 'app-midi-info-dialog',
  templateUrl: './midi-info-dialog.component.html',
  styleUrls: ['./midi-info-dialog.component.css'],
})
export class MIDIInfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MIDIInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MIDIStatus,
    private clipboard: Clipboard,
    private snackbar: MatSnackBar
  ) {}

  getTableData() {
    return this.data.devices;
  }

  copyName(name: string) {
    this.clipboard.copy(name);
    this.snackbar.open('Name copied!', 'Dismiss', { duration: 2000 });
  }
}
