import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, merge } from 'lodash-es';
import { debounceTime, tap } from 'rxjs';
import { Action } from 'src/app/models/action.model';
import { CopyObject } from 'src/app/models/copy-object.model';
import { Transform } from 'src/app/models/transform.model';
import { CopyService } from 'src/app/services/copy.service';
import { EventService } from 'src/app/services/event.service';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css'],
})
export class ActionComponent implements OnInit {
  @Input() path?: string;
  @Input() action?: Action;

  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();

  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;

  schema: any;

  indicatorColor: string = 'gray';

  formGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  constructor(
    public eventService: EventService,
    public schemaService: SchemaService,
    private snackBar: MatSnackBar,
    public copyService: CopyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService
        .getActionEventsForPath(this.path)
        .pipe(
          tap((actionEvent) => {
            if (actionEvent.data.fired) {
              this.indicatorColor = 'greenyellow';
            }
          }),
          debounceTime(200)
        )
        .subscribe((actionEvent) => {
          this.indicatorColor = 'gray';
        });
    }
    if (this.action?.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Action', this.action.type);
    }
    if (this.action && this.action?.transforms === undefined) {
      this.action.transforms = [];
    }

    if (this.action && this.formGroup) {
      this.formGroup.patchValue(this.action);
    }
    this.formGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  formUpdated() {
    merge(this.action, this.formGroup.value);
    this.updated.emit(true);
  }

  transformUpdated() {
    this.updated.emit(true);
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  deleteTransform(index: number) {
    this.action?.transforms?.splice(index, 1);
    this.updated.emit(true);
    this.snackBar.open('Transform Removed', 'Dismiss', {
      duration: 3000,
    });
  }

  addTransform(transformType: string) {
    if (this.action && this.action?.transforms === undefined) {
      this.action.transforms = [];
    }
    const transformTemplate = this.schemaService.getTemplateForTransform(transformType);
    this.action?.transforms?.push(transformTemplate);

    this.updated.emit(true);
  }

  paramsUpdated(params: any) {
    if (this.action) {
      this.action.params = params;
    }

    this.updated.emit(true);
  }

  drop(event: CdkDragDrop<Transform[]>) {
    if (event.previousContainer === event.container) {
      if (this.action?.transforms !== undefined) {
        moveItemInArray(this.action?.transforms, event.previousIndex, event.currentIndex);
        this.updated.emit(true);
      }
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.updated.emit(true);
    }
  }

  getSubActions(): Action[] | undefined {
    if (
      (this.action?.type === 'delay' || this.action?.type === 'random') &&
      this.action.params &&
      this.action.params['actions']
    ) {
      if (typeof this.action.params['actions'] === 'object') {
        return this.action.params['actions'];
      }
    }
    return undefined;
  }

  addSubAction(actionType: string) {
    if (this.action?.params) {
      if (this.action.params['actions'] === undefined) {
        this.action.params['actions'] = [];
      }
      const actionTemplate = this.schemaService.getTemplateForAction(actionType);
      this.action.params['actions'].push(actionTemplate);
      this.updated.emit(true);
    }
  }

  deleteSubAction(index: number) {
    if (this.action?.params) {
      this.action?.params['actions'].splice(index, 1);
      this.updated.emit(true);
    }
  }

  subActionUpdated() {
    this.updated.emit(true);
  }

  copyMe() {
    if (this.action !== undefined) {
      this.copyService.setCopyObject({
        type: 'Action',
        object: this.action,
      });
    }
  }

  pasteTransform(copyObject: CopyObject) {
    if (this.action && this.action?.transforms === undefined) {
      this.action.transforms = [];
    }
    this.action?.transforms?.push(cloneDeep(copyObject.object));
    this.updated.emit(true);
  }

  getListId(): string {
    if (this.path) {
      const id = this.path.replaceAll('/', '.');
      if (!this.eventService.actionIdList.includes(id)) {
        this.eventService.actionIdList.push(id);
      }
      return id;
    }
    return '';
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }
}
