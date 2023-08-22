import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge } from 'lodash';
import { Subject } from 'rxjs';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { CopyObject } from 'src/app/models/copy-object.model';
import { ObjectInfo } from 'src/app/models/form.model';
import { CopyService } from 'src/app/services/copy.service';
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
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();

  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;
  triggerTypes: ObjectInfo[] = [];

  schema?: any;

  hasSettings: boolean = false;
  constructor(
    private schemaService: SchemaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public copyService: CopyService
  ) {
    this;
  }

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

  protocolParamsUpdated(params: any) {
    merge(this.protocol?.params, params);
    this.updated.emit(true);
  }

  deleteTrigger(index: number) {
    this.protocol?.triggers?.splice(index, 1);
    this.updated.emit(true);
    this.snackBar.open('Trigger Removed', 'Dismiss', {
      duration: 3000,
    });
  }

  triggerUpdated() {
    this.updated.emit(true);
  }

  addTrigger(triggerType: string) {
    if (this.protocol && this.protocol?.triggers === undefined) {
      this.protocol.triggers = [];
    }
    const triggerTemplate = this.schemaService.getTemplateForTrigger(triggerType);
    this.protocol?.triggers?.push(triggerTemplate);
    this.updated.emit(true);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.protocol?.triggers !== undefined) {
      moveItemInArray(this.protocol?.triggers, event.previousIndex, event.currentIndex);
      this.updated.emit(true);
    }
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }

  pasteTrigger(copyObject: CopyObject) {
    if (this.protocol && this.protocol?.triggers === undefined) {
      this.protocol.triggers = [];
    }
    this.protocol?.triggers?.push(copyObject.object);
    this.updated.emit(true);
  }

  validCopyObject(copyObject: CopyObject) {
    return copyObject && this.triggerTypes.find((objectInfo) => objectInfo.type === copyObject.object.type);
  }
}
