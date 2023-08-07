import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Action } from 'src/app/models/action.model';
import { ItemInfo } from 'src/app/models/form.model';
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

  triggerIndicatorVisibility: boolean = false;

  constructor(
    private eventService: EventService,
    public schemaService: SchemaService
  ) {}

  ngOnInit() {
    if (this.path) {
      this.eventService.getTriggersForPath(this.path).subscribe((triggerEvent) => {
        if (triggerEvent.data.fired) {
          this.flashIndicator();
        }
      });
    }
  }

  deleteAction(index: number) {
    if (this.trigger) {
      this.trigger?.actions?.splice(index, 1);
      this.updated.emit(this.trigger);
    }
  }

  actionUpdated(index: number, action: Action) {
    if (this.trigger) {
      if (this.trigger?.actions !== undefined && this.trigger.actions[index] !== undefined) {
        const triggerCopy = JSON.parse(JSON.stringify(this.trigger));
        triggerCopy.actions[index] = action;
        this.updated.emit(triggerCopy);
      }
    }
  }

  addAction(actionType: string) {
    this.trigger?.actions?.push({
      type: actionType,
      enabled: true,
    });
    this.updated.emit(this.trigger);
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  update(trigger: Trigger) {
    this.updated.next({
      ...this.trigger,
      ...trigger,
    });
  }

  flashIndicator() {
    this.triggerIndicatorVisibility = true;
    setTimeout(() => {
      this.triggerIndicatorVisibility = false;
    }, 200);
  }
}
