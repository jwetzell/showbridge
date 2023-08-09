import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { cloneDeep } from 'lodash';
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
    // TODO(jwetzell): figure this out properly

    if (this.trigger) {
      this.trigger?.actions?.splice(index, 1);
    }
    if (!this.pendingUpdate) {
      this.pendingUpdate = cloneDeep(this.trigger);
    }
    this.pendingUpdate?.actions?.splice(index, 1);
    this.updated.emit(this.pendingUpdate);
  }

  actionUpdated(index: number, action: Action) {
    // TODO(jwetzell): figure this out properly

    if (this.trigger) {
      if (this.trigger?.actions !== undefined && this.trigger.actions[index] !== undefined) {
        if (!this.pendingUpdate) {
          this.pendingUpdate = cloneDeep(this.trigger);
        }

        if (this.pendingUpdate && this.pendingUpdate.actions) {
          this.pendingUpdate.actions[index] = {
            ...this.pendingUpdate.actions[index],
            ...action,
          };
          this.updated.emit(this.pendingUpdate);
        }
      }
    }
  }

  addAction(actionType: string) {
    // TODO(jwetzell): figure this out properly
    if (this.trigger && this.trigger?.actions === undefined) {
      console.log('setting trigger actions to empty array');
      this.trigger.actions = [];
    }
    if (!this.pendingUpdate) {
      this.pendingUpdate = cloneDeep(this.trigger);
    }

    this.trigger?.actions?.push({
      type: actionType,
      enabled: true,
    });

    if (this.pendingUpdate && this.pendingUpdate.actions === undefined) {
      this.pendingUpdate.actions = [];
    }

    this.pendingUpdate?.actions?.push({
      type: actionType,
      enabled: true,
    });
    this.updated.emit(this.pendingUpdate);
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  update(trigger: Trigger) {
    // TODO(jwetzell): figure this out properly

    if (!this.pendingUpdate) {
      this.pendingUpdate = cloneDeep(this.trigger);
    }

    this.pendingUpdate = {
      ...this.pendingUpdate,
      ...trigger,
    };
    this.trigger = {
      ...this.pendingUpdate,
      ...trigger,
    };
    this.updated.next(this.pendingUpdate);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.trigger?.actions !== undefined) {
      moveItemInArray(this.trigger?.actions, event.previousIndex, event.currentIndex);
      if (this.pendingUpdate && this.pendingUpdate.actions) {
        moveItemInArray(this.pendingUpdate.actions, event.previousIndex, event.currentIndex);
        this.updated.emit(this.pendingUpdate);
      } else {
        this.updated.emit(this.trigger);
      }
    }
  }
}
