import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, merge } from 'lodash';
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
  @Output() updated: EventEmitter<Action> = new EventEmitter<Action>();

  schema: any;

  pendingUpdate?: Action;
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

  transformUpdated(index: number, transform: Transform) {
    if (this.action?.transforms !== undefined && this.action.transforms[index] !== undefined) {
      merge(this.action.transforms[index], transform);
      this.pendingUpdate = cloneDeep(this.action);
      this.updated.emit(this.pendingUpdate);
    }
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  deleteTransform(index: number) {
    this.action?.transforms?.splice(index, 1);
    this.pendingUpdate = cloneDeep(this.action);
    this.updated.emit(this.pendingUpdate);
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

    this.pendingUpdate = cloneDeep(this.action);
    this.updated.emit(this.pendingUpdate);
  }

  update(action: Action) {
    merge(this.action, action);
    this.pendingUpdate = cloneDeep(this.action);
    this.updated.emit(this.pendingUpdate);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.action?.transforms !== undefined) {
      moveItemInArray(this.action?.transforms, event.previousIndex, event.currentIndex);
      this.pendingUpdate = cloneDeep(this.action);
      this.updated.emit(this.pendingUpdate);
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

  addSubAction(actionType: string) {
    if (this.action?.params) {
      if (this.action.params['actions'] === undefined) {
        this.action.params['actions'] = [];
      }
      const actionTemplate = this.schemaService.getTemplateForAction(actionType);
      this.action.params['actions'].push(actionTemplate);
      this.pendingUpdate = cloneDeep(this.action);
      this.updated.emit(this.pendingUpdate);
    }
  }

  deleteSubAction(index: number) {
    if (this.action?.params) {
      this.action?.params['actions'].splice(index, 1);
      this.pendingUpdate = cloneDeep(this.action);
      this.updated.emit(this.pendingUpdate);
    }
  }

  subActionUpdated(index: number, action: Action) {
    if (this.action?.params) {
      if (this.action?.params['actions'] !== undefined && this.action?.params['actions'][index] !== undefined) {
        merge(this.action?.params['actions'][index], action);

        this.pendingUpdate = cloneDeep(this.action);
        this.updated.emit(this.pendingUpdate);
      }
    }
  }

  copyMe() {
    if (this.pendingUpdate !== undefined) {
      this.copyService.setCopyObject({
        type: 'Action',
        object: this.pendingUpdate,
      });
    } else if (this.action !== undefined) {
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
    this.pendingUpdate = cloneDeep(this.action);
    this.updated.emit(this.pendingUpdate);
  }
}
