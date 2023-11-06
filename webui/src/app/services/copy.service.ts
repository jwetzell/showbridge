import { Injectable } from '@angular/core';
import { has, isEqual, noop } from 'lodash-es';
import { BehaviorSubject, Observable, distinctUntilChanged, filter } from 'rxjs';
import { CopyObject } from '../models/copy-object.model';
import { SchemaService } from './schema.service';
@Injectable({
  providedIn: 'root',
})
export class CopyService {
  private maxHistoryLength: number = 20;
  // TODO(jwetzell): actually implement copy history
  history: CopyObject[] = [];

  private currentCopyObject: BehaviorSubject<CopyObject | undefined> = new BehaviorSubject<CopyObject | undefined>(
    undefined
  );

  public currentCopyObject$: Observable<CopyObject | undefined> = this.currentCopyObject.asObservable().pipe(
    distinctUntilChanged((a, b) => isEqual(a, b)),
    filter((val) => !!val)
  );

  constructor(private schemaService: SchemaService) {}

  setCopyObject(copyObject: CopyObject) {
    this.currentCopyObject.next(copyObject);
    this.history.push(copyObject);
    if (this.history.length > this.maxHistoryLength) {
      this.history.splice(0, 1);
    }
  }

  getClipboardForType(type: 'Trigger' | 'Action' | 'Transform'): Observable<CopyObject | undefined> {
    return this.currentCopyObject$.pipe(filter((val) => val?.type === type));
  }

  checkClipboard() {
    navigator.clipboard.readText().then((value) => {
      if (value) {
        try {
          const parsedClipboard = JSON.parse(value);
          if (!has(parsedClipboard, 'type')) {
            return;
          }

          if (has(parsedClipboard, 'object')) {
            // NOTE(jwetzell): already a copy or template object
            this.currentCopyObject.next(parsedClipboard);
          } else if (has(parsedClipboard, 'enabled')) {
            // NOTE(jwetzell): this seems like a regular JSON object
            const type = this.schemaService.getObjectTypeFromObject(parsedClipboard);
            if (type !== undefined) {
              this.currentCopyObject.next({
                type,
                object: parsedClipboard,
              });
            }
          }
        } catch (error) {
          noop();
        }
      }
    });
  }
}
