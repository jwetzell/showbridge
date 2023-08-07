import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action } from 'src/app/models/action.model';
import { EventService } from 'src/app/services/event.service';

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

  actionIndicatorVisibility: boolean = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService.getActionEventsForPath(this.path).subscribe((actionEvent) => {
        if (actionEvent.data.fired) {
          this.flashIndicator();
        }
      });
    }
  }

  transformUpdated(index: number, action: Action) {
    if (this.action) {
      if (this.action?.transforms !== undefined && this.action.transforms[index] !== undefined) {
        const actionCopy = JSON.parse(JSON.stringify(this.action));
        actionCopy.transforms[index] = action;
        this.updated.emit(actionCopy);
      }
    }
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  deleteTransform(index: number) {
    if (this.action) {
      this.action?.transforms?.splice(index, 1);
      this.updated.emit(this.action);
    }
  }

  update(action: Action) {
    this.updated.emit({
      ...this.action,
      ...action,
    });
  }

  flashIndicator() {
    this.actionIndicatorVisibility = true;
    setTimeout(() => {
      this.actionIndicatorVisibility = false;
    }, 200);
  }
}
