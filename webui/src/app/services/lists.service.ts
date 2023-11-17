import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  public actionListIds: string[] = [];
  public transformListIds: string[] = [];
  public triggerListIds: string[] = [];

  registerActionList(path: string | undefined) {
    if (path === undefined) {
      return '';
    }

    const id = this.pathToId(path);
    if (!this.actionListIds.includes(id)) {
      this.actionListIds.push(id);
    }
    return id;
  }

  registerTransformList(path: string | undefined) {
    if (path === undefined) {
      return '';
    }

    const id = this.pathToId(path);
    if (!this.actionListIds.includes(id)) {
      this.actionListIds.push(id);
    }
    return id;
  }

  registerTriggerList(path: string | undefined) {
    if (path === undefined) {
      return '';
    }

    const id = this.pathToId(path);
    if (!this.triggerListIds.includes(id)) {
      this.triggerListIds.push(id);
    }
    return id;
  }

  pathToId(path: string) {
    return path.replaceAll('/', '.');
  }
}
