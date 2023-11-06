import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { merge } from 'lodash-es';
import { debounceTime, tap } from 'rxjs';
import { Transform } from 'src/app/models/transform.model';
import { CopyService } from 'src/app/services/copy.service';
import { EventService } from 'src/app/services/event.service';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-transform',
  templateUrl: './transform.component.html',
  styleUrls: ['./transform.component.css'],
})
export class TransformComponent implements OnInit {
  @Input() transform?: Transform;
  @Input() path?: string;

  @Output() delete: EventEmitter<string> = new EventEmitter<string>();
  @Output() updated: EventEmitter<Boolean> = new EventEmitter<Boolean>();
  @ViewChild('settingsDialogRef') dialogRef?: TemplateRef<any>;

  formGroup: FormGroup = new FormGroup({
    type: new FormControl('any'),
    comment: new FormControl(''),
    enabled: new FormControl(true),
  });

  schema: any;
  indicatorColor: string = 'gray';

  isInError: boolean = false;

  constructor(
    private eventService: EventService,
    private schemaService: SchemaService,
    private copyService: CopyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.path) {
      this.eventService
        .getTransformEventsForPath(this.path)
        .pipe(
          tap((transformEvent) => {
            if (transformEvent.data.fired) {
              this.indicatorColor = 'greenyellow';
            }
          }),
          debounceTime(200)
        )
        .subscribe((transformEvent) => {
          this.indicatorColor = 'gray';
        });

      this.schemaService.errorPaths.asObservable().subscribe((errorPaths) => {
        if (this.path) {
          this.isInError = errorPaths.includes(this.path);
        }
      });
    }
    if (this.transform?.type) {
      this.schema = this.schemaService.getSchemaForObjectType('Transform', this.transform.type);
    }

    if (this.transform && this.formGroup) {
      this.formGroup.patchValue(this.transform);
    }
    this.formGroup.valueChanges.subscribe((value) => {
      this.formUpdated();
    });
  }

  formUpdated() {
    merge(this.transform, this.formGroup.value);
    this.updated.emit(true);
  }

  paramsUpdated(params: any) {
    if (this.transform) {
      this.transform.params = params;
    }

    this.updated.emit(true);
  }

  deleteMe() {
    this.delete.emit(this.path);
  }

  update() {
    this.updated.emit(true);
  }

  copyMe() {
    if (this.transform !== undefined) {
      this.copyService.setCopyObject({
        type: 'Transform',
        object: this.transform,
      });
    }
  }

  openSettingsDialog() {
    if (this.dialogRef) {
      this.dialog.open(this.dialogRef);
    }
  }
}
