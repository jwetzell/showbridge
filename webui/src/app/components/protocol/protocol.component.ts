import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, merge } from 'lodash';
import { Subject } from 'rxjs';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { ObjectInfo } from 'src/app/models/form.model';
import { Trigger } from 'src/app/models/trigger.model';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-protocol',
  templateUrl: './protocol.component.html',
  styleUrls: ['./protocol.component.css'],
})
export class ProtocolComponent {
  @Input() protocolType?: string;
  @Input() protocol?: ProtocolConfiguration;
  @Input() openSettings: Subject<boolean> = new Subject<boolean>();
  @Output() updated: EventEmitter<ProtocolConfiguration> = new EventEmitter<ProtocolConfiguration>();

  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;
  triggerTypes: ObjectInfo[] = [];

  pendingUpdate?: ProtocolConfiguration;

  schema?: any;

  hasSettings: boolean = false;

  constructor(
    private schemaService: SchemaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.openSettings.subscribe((val) => {
      if (val) {
        this.openSettingsDialog();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.protocolType) {
      this.triggerTypes = this.schemaService.getTriggerTypesForProtocol(this.protocolType);

      this.schema = this.schemaService.getSchemaForProtocol(this.protocolType);
      this.hasSettings = this.schema.properties.params !== undefined;
    }
  }

  protocolUpdated(updatedProtocol: ProtocolConfiguration) {
    merge(this.protocol, updatedProtocol);
    this.pendingUpdate = cloneDeep(this.protocol);
    this.updated.emit(this.pendingUpdate);
  }

  deleteTrigger(index: number) {
    this.protocol?.triggers?.splice(index, 1);
    this.pendingUpdate = cloneDeep(this.protocol);
    this.updated.emit(this.pendingUpdate);
    this.snackBar.open('Trigger Removed', 'Dismiss', {
      duration: 3000,
    });
  }

  triggerUpdated(index: number, trigger: Trigger) {
    if (this.protocol?.triggers !== undefined && this.protocol.triggers[index] !== undefined) {
      merge(this.protocol.triggers[index], trigger);

      this.pendingUpdate = cloneDeep(this.protocol);
      this.updated.emit(this.pendingUpdate);
    }
  }

  addTrigger(triggerType: string) {
    if (this.protocol && this.protocol?.triggers === undefined) {
      this.protocol.triggers = [];
    }
    const triggerTemplate = this.schemaService.getTemplateForTrigger(triggerType);
    this.protocol?.triggers?.push(triggerTemplate);
    this.pendingUpdate = cloneDeep(this.protocol);
    this.updated.emit(this.pendingUpdate);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.protocol?.triggers !== undefined) {
      moveItemInArray(this.protocol?.triggers, event.previousIndex, event.currentIndex);
      this.pendingUpdate = cloneDeep(this.protocol);
      this.updated.emit(this.pendingUpdate);
    }
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }
}
