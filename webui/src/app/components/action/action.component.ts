import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  actionIndicatorVisibility: boolean = false;

  constructor(
    private eventService: EventService,
    public schemaService: SchemaService
  ) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService.getActionEventsForPath(this.path).subscribe((actionEvent) => {
        if (actionEvent.data.fired) {
          this.flashIndicator();
        }
      });
    }
  }

  transformUpdated(index: number, transform: Transform) {
    if (this.action) {
      if (this.action?.transforms !== undefined && this.action.transforms[index] !== undefined) {
        if (!this.pendingUpdate) {
          this.pendingUpdate = JSON.parse(JSON.stringify(this.action));
        }
        if (this.pendingUpdate && this.pendingUpdate?.transforms) {
          this.pendingUpdate.transforms[index] = {
            ...this.pendingUpdate.transforms[index],
            ...transform,
          };
          console.log('action update called because of transform update');
          this.updated.emit(this.pendingUpdate);
        }
      }
    }
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  deleteTransform(index: number) {
    if (this.action) {
      this.action?.transforms?.splice(index, 1);
    }
    if (!this.pendingUpdate) {
      this.pendingUpdate = JSON.parse(JSON.stringify(this.action));
    }
    this.pendingUpdate?.transforms?.splice(index, 1);
    this.updated.emit(this.pendingUpdate);
  }

  addTransform(transformType: string) {
    // TODO(jwetzell): figure this out properly
    if (this.action && this.action?.transforms === undefined) {
      this.action.transforms = [];
    }
    if (!this.pendingUpdate) {
      this.pendingUpdate = JSON.parse(JSON.stringify(this.action));
    }

    this.action?.transforms?.push({
      type: transformType,
      enabled: true,
    });

    if (this.pendingUpdate && this.pendingUpdate.transforms === undefined) {
      this.pendingUpdate.transforms = [];
    }

    this.pendingUpdate?.transforms?.push({
      type: transformType,
      enabled: true,
    });
    this.updated.emit(this.pendingUpdate);
  }

  update(action: Action) {
    console.log(action);
    if (!this.pendingUpdate) {
      this.pendingUpdate = action;
    }
    this.pendingUpdate = {
      ...this.pendingUpdate,
      ...action,
    };
    this.updated.emit(this.pendingUpdate);
  }

  flashIndicator() {
    this.actionIndicatorVisibility = true;
    setTimeout(() => {
      this.actionIndicatorVisibility = false;
    }, 200);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.action?.transforms !== undefined) {
      moveItemInArray(this.action?.transforms, event.previousIndex, event.currentIndex);
      if (this.pendingUpdate && this.pendingUpdate.transforms) {
        moveItemInArray(this.pendingUpdate.transforms, event.previousIndex, event.currentIndex);
        this.updated.emit(this.pendingUpdate);
      } else {
        this.updated.emit(this.action);
      }
    }
  }
}
