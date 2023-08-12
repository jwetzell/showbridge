import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, merge } from 'lodash';
import { debounceTime, tap } from 'rxjs';
import { Action } from 'src/app/models/action.model';
import { Trigger } from 'src/app/models/trigger.model';
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
  @Output() updated: EventEmitter<Trigger> = new EventEmitter<Trigger>();
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;

  schema: any;

  indicatorColor: string = 'gray';
  pendingUpdate?: Trigger;

  formGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  constructor(
    private eventService: EventService,
    public schemaService: SchemaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
    this.pendingUpdate = cloneDeep(this.trigger);
    this.updated.emit(this.pendingUpdate);
    this.snackBar.open('Action Removed', 'Dismiss', {
      duration: 3000,
    });
  }

  actionUpdated(index: number, action: Action) {
    if (this.trigger?.actions !== undefined && this.trigger.actions[index] !== undefined) {
      merge(this.trigger.actions[index], action);

      this.pendingUpdate = cloneDeep(this.trigger);
      this.updated.emit(this.pendingUpdate);
    }
  }

  addAction(actionType: string) {
    if (this.trigger && this.trigger?.actions === undefined) {
      this.trigger.actions = [];
    }
    const actionTemplate = this.schemaService.getTemplateForAction(actionType);
    this.trigger?.actions?.push(actionTemplate);
    this.pendingUpdate = cloneDeep(this.trigger);
    this.updated.emit(this.pendingUpdate);
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  update(trigger: Trigger) {
    merge(this.trigger, trigger);
    this.pendingUpdate = cloneDeep(this.trigger);
    this.updated.emit(this.pendingUpdate);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.trigger?.actions !== undefined) {
      moveItemInArray(this.trigger?.actions, event.previousIndex, event.currentIndex);
      this.pendingUpdate = cloneDeep(this.trigger);
      this.updated.emit(this.pendingUpdate);
    }
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }
}
