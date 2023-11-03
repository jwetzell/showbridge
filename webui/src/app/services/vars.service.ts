import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
@Injectable({
  providedIn: 'root',
})
export class VarsService {
  varsUrl?: URL;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    settingsService.varsUrl.subscribe((url) => {
      console.log(`vars url: ${url.toString()}`);
      this.varsUrl = url;
      this.loadVars();
    });
  }

  loadVars() {
    if (this.varsUrl) {
      this.http.get<any>(this.varsUrl.toString()).subscribe((vars) => {
        console.log(vars);
      });
    } else {
      throw new Error('vars: no vars url set');
    }
  }

  uploadVars(vars: any) {
    if (this.varsUrl) {
      return this.http.post(this.varsUrl.toString(), vars, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('vars: no vars url set');
    }
  }
}
