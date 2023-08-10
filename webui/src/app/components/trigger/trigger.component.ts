import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  indicatorColor: string = 'gray';
  pendingUpdate?: Trigger;

  constructor(
    private eventService: EventService,
    public schemaService: SchemaService
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
  }

  deleteAction(index: number) {
    this.trigger?.actions?.splice(index, 1);
    this.pendingUpdate = cloneDeep(this.trigger);
    this.updated.emit(this.pendingUpdate);
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
    this.trigger?.actions?.push({
      type: actionType,
      enabled: true,
    });
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
}
