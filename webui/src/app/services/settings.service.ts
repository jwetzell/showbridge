import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public isDummySite: boolean = false;
  public configPath: string = '/config';
  public schemaPath: string = '/config/schema';
  public varsPath: string = '/vars';
  public baseUrl: string = window.location.href;

  public configUrl: BehaviorSubject<URL> = new BehaviorSubject<URL>(new URL(this.configPath, this.baseUrl));
  public schemaUrl: BehaviorSubject<URL> = new BehaviorSubject<URL>(new URL(this.schemaPath, this.baseUrl));
  public websocketUrl: BehaviorSubject<URL> = new BehaviorSubject<URL>(new URL(this.baseUrl.replace('http', 'ws')));
  public varsUrl: BehaviorSubject<URL> = new BehaviorSubject<URL>(new URL(this.varsPath, this.baseUrl));
  constructor() {}

  setupForDummySite() {
    this.isDummySite = true;
    this.configPath = '/config.json';
    this.schemaPath = '/config.schema.json';
    this.updateBaseUrl(window.location.href);
  }

  updateBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.configUrl.next(new URL(this.configPath, baseUrl));
    this.schemaUrl.next(new URL(this.schemaPath, baseUrl));
    this.websocketUrl.next(new URL(this.baseUrl.replace('http', 'ws')));
    this.varsUrl.next(new URL(this.varsPath, baseUrl));
  }
}
