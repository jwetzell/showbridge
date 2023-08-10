import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { cloneDeep, merge } from 'lodash';
import { debounceTime, tap } from 'rxjs';
import { Action } from 'src/app/models/action.model';
import { Transform } from 'src/app/models/transform.model';
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

  pendingUpdate?: Action;
  indicatorColor: string = 'gray';

  constructor(
    private eventService: EventService,
    public schemaService: SchemaService
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
}
