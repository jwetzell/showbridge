import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MIDIPatch, NetworkPatch } from '@showbridge/types';
import { combineLatest, filter, take } from 'rxjs';
import { MIDIDeviceInfo } from 'src/app/models/events.model';
import { EventService } from 'src/app/services/event.service';
import { SettingsService } from 'src/app/services/settings.service';
import { VarsService } from 'src/app/services/vars.service';
import { ImportJSONComponent } from '../import-json/import-json.component';

@Component({
  selector: 'app-patch-editor',
  templateUrl: './patch-editor.component.html',
  styleUrls: ['./patch-editor.component.css'],
  standalone: false,
})
export class PatchEditorComponent {
  midiPorts: MIDIDeviceInfo[] = [];

  midiEnabled: boolean = true;
  midiPatches: MIDIPatch[] = [];
  networkPatches: NetworkPatch[] = [];

  constructor(
    public varsService: VarsService,
    private eventService: EventService,
    private snackbar: MatSnackBar,
    public settingsService: SettingsService,
    private clipboard: Clipboard,
    private dialog: MatDialog
  ) {
    eventService.protocolStatus$
      .pipe(
        filter((protocolStatus) => protocolStatus.data?.midi !== undefined),
        take(1)
      )
      .subscribe((protocolStatus) => {
        if (protocolStatus.data?.midi !== undefined) {
          this.midiEnabled = protocolStatus.data.midi.enabled;
          this.midiPorts = protocolStatus.data?.midi?.devices?.filter((device) => device.type === 'output');
        }
      });

    varsService.currentVars.subscribe((vars) => {
      if (vars.patches !== undefined) {
        if (vars.patches.midi !== undefined && Array.isArray(vars.patches.midi)) {
          this.midiPatches = vars.patches.midi;
        }
        if (vars.patches.network !== undefined && Array.isArray(vars.patches.network)) {
          this.networkPatches = vars.patches.network;
        }
      }
    });
  }
  midiPatchDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.midiPatches, event.previousIndex, event.currentIndex);
  }

  networkPatchDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.networkPatches, event.previousIndex, event.currentIndex);
  }

  addNetworkPatch() {
    this.networkPatches.push({ name: '', host: '', port: 8000 });
  }

  addMIDIPatch() {
    this.midiPatches.push({ name: '', port: '' });
  }

  copyMIDIDevices() {
    this.clipboard.copy(JSON.stringify(this.midiPorts));
    this.snackbar.open('Device list copied....', undefined, { duration: 3000 });
  }

  importMIDIDevices() {
    const dialogRef = this.dialog.open(ImportJSONComponent, {
      width: '400px',
      height: '400px',
      data: {
        title: 'Import Device List',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result) => !!result && result !== ''))
      .subscribe((result) => {
        this.midiPorts = result;
      });
  }

  savePatches() {
    this.midiPatches = this.midiPatches.filter((patch) => patch.port !== undefined);
    this.networkPatches = this.networkPatches.filter((patch) => patch.host !== '');

    combineLatest([
      this.varsService.updateMIDIPatches(this.midiPatches),
      this.varsService.updateNetworkPatches(this.networkPatches),
    ]).subscribe((resp) => {
      this.snackbar.open('Patches saved....', undefined, { duration: 3000 });
    });

    this.varsService.loadVars();
  }
}
