import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, merge } from 'lodash-es';
import { debounceTime, tap } from 'rxjs';
import { Action } from 'src/app/models/action.model';
import { CopyObject } from 'src/app/models/copy-object.model';
import { Trigger } from 'src/app/models/trigger.model';
import { CopyService } from 'src/app/services/copy.service';
import { EventService } from 'src/app/services/event.service';
import { ListsService } from 'src/app/services/lists.service';
import { SchemaService } from 'src/app/services/schema.service';
@Component({
  selector: 'app-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.css'],
})
export class TriggerComponent implements OnInit {
  @Input() path?: string;
  @Input() trigger?: Trigger;
  @Input() showActions: boolean = true;
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @Output() delete: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;

  schema: any;

  indicatorColor: string = 'gray';

  formGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  isInError: boolean = false;

  constructor(
    public eventService: EventService,
    public schemaService: SchemaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public copyService: CopyService,
    public listsService: ListsService
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

      this.schemaService.errorPaths.asObservable().subscribe((errorPaths) => {
        if (this.path) {
          this.isInError = errorPaths.includes(this.path);
        }
      });
    }

    if (this.trigger?.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Trigger', this.trigger.type);
      if (this.trigger && this.formGroup) {
        this.formGroup.patchValue(this.trigger);
      }
      this.formGroup.valueChanges.subscribe((value) => {
        this.formUpdated();
      });
    }
  }

  formUpdated() {
    merge(this.trigger, this.formGroup.value);
    this.updated.emit(true);
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
    const actionTemplate = this.schemaService.getSkeletonForAction(actionType);
    this.trigger?.actions?.push(actionTemplate);
    this.updated.emit(true);
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  paramsUpdated(params: any) {
    if (this.trigger) {
      this.trigger.params = params;
    }
    this.updated.emit(true);
  }

  drop(event: CdkDragDrop<Action[]>) {
    if (event.previousContainer === event.container) {
      if (this.trigger?.actions !== undefined) {
        moveItemInArray(this.trigger?.actions, event.previousIndex, event.currentIndex);
        this.updated.emit(true);
      }
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
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
    if (Array.isArray(copyObject.object)) {
      this.trigger?.actions?.push(...cloneDeep(copyObject.object));
    } else {
      this.trigger?.actions?.push(cloneDeep(copyObject.object));
    }
    this.updated.emit(true);
  }

  getListId(): string {
    if (this.path) {
      const id = this.path.replaceAll('/', '.');
      if (!this.listsService.triggerListIds.includes(id)) {
        this.listsService.triggerListIds.push(id);
      }
      return id;
    }
    return '';
  }

  deleteSubTrigger(index: number) {
    if (this.trigger?.subTriggers) {
      this.trigger?.subTriggers.splice(index, 1);
      this.updated.emit(true);
    }
  }

  subTriggerUpdated() {
    this.updated.emit(true);
  }

  addSubTrigger(triggerType: string) {
    if (this.trigger && this.trigger?.subTriggers === undefined) {
      this.trigger.subTriggers = [];
    }

    if (this.trigger?.subTriggers) {
      if (this.trigger.subTriggers === undefined) {
        this.trigger.subTriggers = [];
      }
      const triggerTemplate = this.schemaService.getSkeletonForTrigger(triggerType);
      this.trigger.subTriggers.push(triggerTemplate);
      this.updated.emit(true);
    }
  }
}
