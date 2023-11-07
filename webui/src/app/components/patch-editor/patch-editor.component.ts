import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, take } from 'rxjs';
import { MIDIDeviceInfo } from 'src/app/models/events.model';
import { MIDIPatch, NetworkPatch } from 'src/app/models/patches.model';
import { EventService } from 'src/app/services/event.service';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'app-patch-editor',
  templateUrl: './patch-editor.component.html',
  styleUrls: ['./patch-editor.component.css'],
})
export class PatchEditorComponent {
  midiPorts: MIDIDeviceInfo[] = [];

  midiPatches: MIDIPatch[] = [];
  networkPatches: NetworkPatch[] = [];

  constructor(
    public varsService: VarsService,
    private eventService: EventService,
    private snackbar: MatSnackBar
  ) {
    eventService.protocolStatus$
      .pipe(
        filter((protocolStatus) => protocolStatus.data?.midi !== undefined),
        take(1)
      )
      .subscribe((protocolStatus) => {
        console.log(protocolStatus);
        if (protocolStatus.data?.midi !== undefined) {
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
    this.networkPatches.push({ name: '', host: '', port: 1 });
  }

  addMIDIPatch() {
    this.midiPatches.push({ name: '' });
  }

  savePatches() {
    this.midiPatches = this.midiPatches.filter((patch) => patch.port !== undefined);
    this.networkPatches = this.networkPatches.filter((patch) => patch.host !== '');

    this.varsService.updateMIDIPatches(this.midiPatches).subscribe((resp) => {
      this.snackbar.open('MIDI patches saved....', undefined, { duration: 3000 });
    });

    this.varsService.updateNetworkPatches(this.networkPatches).subscribe((resp) => {
      this.snackbar.open('Network patches saved....', undefined, { duration: 3000 });
    });
    this.varsService.loadVars();
  }
}