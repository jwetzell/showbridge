import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, tap } from 'rxjs';
import { Action } from 'src/app/models/action.model';
import { CopyObject } from 'src/app/models/copy-object.model';
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

  schema: any;

  indicatorColor: string = 'gray';

  constructor(
    private eventService: EventService,
    public schemaService: SchemaService,
    private snackBar: MatSnackBar,
    public copyService: CopyService
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

  update(action: Action) {
    this.action = action;
    this.updated.emit(true);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.action?.transforms !== undefined) {
      moveItemInArray(this.action?.transforms, event.previousIndex, event.currentIndex);
      this.updated.emit(true);
    }
  }

  getSubActions(): Action[] | undefined {
    if (this.action?.type === 'delay' && this.action.params && this.action.params['actions']) {
      if (typeof this.action.params['actions'] === 'object') {
        return this.action.params['actions'];
      }
    }
    return undefined;
  }

  addSubAction(actionType: string) {}

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
    this.action?.transforms?.push(copyObject.object);
    this.updated.emit(true);
  }
}
