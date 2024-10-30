import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TriggerObj, TriggerParams } from '@showbridge/types';
import { cloneDeep } from 'lodash-es';
import { ProtocolConfiguration } from 'src/app/models/config.models';
import { CopyObject } from 'src/app/models/copy-object.model';
import { ObjectInfo } from 'src/app/models/form.model';
import { CopyService } from 'src/app/services/copy.service';
import { ListsService } from 'src/app/services/lists.service';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-message-type',
  templateUrl: './message-type.component.html',
  styleUrls: ['./message-type.component.css'],
})
export class MessageTypeComponent {
  @Input() messageType?: string;
  @Input() messageTypeConfig?: ProtocolConfiguration;
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();

  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;
  triggerTypes: ObjectInfo[] = [];

  schema?: any;

  hasSettings: boolean = false;
  constructor(
    private schemaService: SchemaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public copyService: CopyService,
    public listsService: ListsService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.messageType) {
      this.triggerTypes = this.schemaService.getTriggerTypesForMessageType(this.messageType);

      this.schema = this.schemaService.getSchemaForMessageType(this.messageType);
      this.hasSettings = this.schema.properties.params !== undefined;
    }
  }

  protocolParamsUpdated(params: any) {
    if (this.messageTypeConfig) {
      this.messageTypeConfig.params = params;
    }
    this.updated.emit(true);
  }

  deleteTrigger(index: number) {
    this.messageTypeConfig?.triggers?.splice(index, 1);
    this.updated.emit(true);
    this.snackBar.open('Trigger Removed', 'Dismiss', {
      duration: 3000,
    });
  }

  triggerUpdated() {
    this.updated.emit(true);
  }

  addTrigger(triggerType: string) {
    if (this.messageTypeConfig && this.messageTypeConfig?.triggers === undefined) {
      this.messageTypeConfig.triggers = [];
    }
    const triggerTemplate = this.schemaService.getSkeletonForTrigger(triggerType);
    this.messageTypeConfig?.triggers?.push(triggerTemplate);
    this.updated.emit(true);
  }

  dropTrigger(event: CdkDragDrop<TriggerObj<TriggerParams>[] | undefined>) {
    if (event.previousContainer === event.container) {
      if (this.messageTypeConfig?.triggers !== undefined) {
        moveItemInArray(this.messageTypeConfig?.triggers, event.previousIndex, event.currentIndex);
        this.updated.emit(true);
      }
    } else if (event.previousContainer.data && event.container.data) {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.updated.emit(true);
    }
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }

  pasteTrigger(copyObject: CopyObject) {
    if (copyObject.type !== 'Trigger') {
      return;
    }

    if (this.messageTypeConfig && this.messageTypeConfig?.triggers === undefined) {
      this.messageTypeConfig.triggers = [];
    }
    if (Array.isArray(copyObject.object)) {
      this.messageTypeConfig?.triggers?.push(...cloneDeep(copyObject.object));
    } else {
      this.messageTypeConfig?.triggers?.push(cloneDeep(copyObject.object));
    }
    this.updated.emit(true);
  }
}
