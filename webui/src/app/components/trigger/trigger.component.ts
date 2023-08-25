import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, tap } from 'rxjs';
import { CopyObject } from 'src/app/models/copy-object.model';
import { Trigger } from 'src/app/models/trigger.model';
import { CopyService } from 'src/app/services/copy.service';
import { EventService } from 'src/app/services/event.service';
import { SchemaService } from 'src/app/services/schema.service';
@Component({
  selector: 'app-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.css'],
})
export class TriggerComponent implements OnInit {
  @Input() path?: string;
  @Input() trigger?: Trigger;
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;

  schema: any;

  indicatorColor: string = 'gray';
  // pendingUpdate?: Trigger;

  formGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  constructor(
    private eventService: EventService,
    public schemaService: SchemaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public copyService: CopyService
  ) {}

  ngOnInit() {
    if (this.path) {
      this.eventService
        .getTriggerEventsForPath(this.path)
        .pipe(
          tap((triggerEvent) => {
            if (triggerEvent.data.fired) {
              this.indicatorColor = 'greenyellow';
            }
          }),
          debounceTime(200)
        )
        .subscribe((triggerEvent) => {
          this.indicatorColor = 'gray';
        });
    }

    if (this.trigger?.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Trigger', this.trigger.type);
      if (this.trigger && this.formGroup) {
        this.formGroup.patchValue(this.trigger);
      }
      this.formGroup.valueChanges.subscribe((value) => {
        this.update(value);
      });
    }
  }

  deleteAction(index: number) {
    this.trigger?.actions?.splice(index, 1);
    this.updated.emit(true);
    this.snackBar.open('Action Removed', 'Dismiss', {
      duration: 3000,
    });
  }

  actionUpdated() {
    this.updated.emit(true);
  }

  addAction(actionType: string) {
    if (this.trigger && this.trigger?.actions === undefined) {
      this.trigger.actions = [];
    }
    const actionTemplate = this.schemaService.getTemplateForAction(actionType);
    this.trigger?.actions?.push(actionTemplate);
    this.updated.emit(true);
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  update(trigger: Trigger) {
    this.trigger = trigger;
    this.updated.emit(true);
  }

  paramsUpdated(params: any) {
    if (this.trigger) {
      this.trigger.params = params;
    }
    this.updated.emit(true);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.trigger?.actions !== undefined) {
      moveItemInArray(this.trigger?.actions, event.previousIndex, event.currentIndex);
      this.updated.emit(true);
    }
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }

  copyMe() {
    if (this.trigger !== undefined) {
      this.copyService.setCopyObject({
        type: 'Trigger',
        object: this.trigger,
      });
    }
  }

  pasteAction(copyObject: CopyObject) {
    if (this.trigger && this.trigger?.actions === undefined) {
      this.trigger.actions = [];
    }
    this.trigger?.actions?.push(copyObject.object);
    this.updated.emit(true);
  }
}
