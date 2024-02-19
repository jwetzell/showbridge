import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { ParamInfo } from 'src/app/models/form.model';
import { ListsService } from 'src/app/services/lists.service';
import { SchemaService } from 'src/app/services/schema.service';

@Component({
  selector: 'app-array-form',
  templateUrl: './array-form.component.html',
  styleUrl: './array-form.component.css',
})
export class ArrayFormComponent implements OnInit {
  @Input() paramFormControl?: any;
  @Input() paramInfo?: ParamInfo;

  minItems: number = 0;
  maxItems: number = Number.MAX_SAFE_INTEGER;

  arrayValue: any[] | undefined;

  constructor(
    private schemaService: SchemaService,
    public listsService: ListsService
  ) {}

  ngOnInit(): void {
    if (this.paramFormControl && this.paramInfo?.schema) {
      this.arrayValue = this.schemaService.parseValueToArray(this.paramFormControl.value, this.paramInfo.schema);

      // this.paramFormControl.valueChanges.subscribe((value: any) => {
      //   if (this.paramSchema) {
      //     this.arrayValue = this.schemaService.parseValueToArray(value, this.paramSchema);
      //   }
      // });
      if (this.paramInfo.schema.minItems) {
        this.minItems = parseInt(this.paramInfo?.schema.minItems);
      }

      if (this.paramInfo.schema.maxItems) {
        this.maxItems = parseInt(this.paramInfo?.schema.maxItems);
      }
    }

    this.ensureArrayMin();
  }

  dropItem(event: CdkDragDrop<any | undefined>) {
    if (this.arrayValue !== undefined) {
      moveItemInArray(this.arrayValue, event.previousIndex, event.currentIndex);
      this.valueUpdated();
    }
  }

  deleteItem(index: number) {
    this.arrayValue?.splice(index, 1);
    this.valueUpdated();

    // this.updated.emit(true);
    // this.snackBar.open('Trigger Removed', 'Dismiss', {
    //   duration: 3000,
    // });
  }

  ensureArrayMin() {
    if (this.arrayValue === undefined) {
      this.arrayValue = [];
    }
    console.log();
    for (let i = 0; i <= this.minItems - this.arrayValue.length; i += 1) {
      this.arrayValue.push(null);
    }
    this.valueUpdated();
  }

  arrayIsMaxed() {
    if (this.arrayValue) {
      return this.arrayValue?.length >= this.maxItems;
    }
    return false;
  }

  addItem() {
    if (this.arrayValue === undefined) {
      this.arrayValue = [];
    }

    if (!this.arrayIsMaxed()) {
      this.arrayValue.push(null);
    }

    this.valueUpdated();
    // this.updated.emit(true);
  }

  valueUpdated() {
    this.paramFormControl.setValue(this.arrayValue);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}
