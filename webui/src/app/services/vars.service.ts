import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MIDIPatch, NetworkPatch, RouterVars } from '@showbridge/types';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from './settings.service';
@Injectable({
  providedIn: 'root',
})
export class VarsService {
  varsUrl?: URL;

  public currentVars: BehaviorSubject<any> = new BehaviorSubject<any>({});

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
        this.currentVars.next(vars);
      });
    } else {
      throw new Error('vars: no vars url set');
    }
  }

  uploadVars(vars: RouterVars) {
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

  updateMIDIPatches(patches: MIDIPatch[]) {
    if (this.varsUrl) {
      return this.http.post(`${this.varsUrl?.toString()}/patches/midi`, patches, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('vars: no vars url set');
    }
  }

  updateNetworkPatches(patches: NetworkPatch[]) {
    if (this.varsUrl) {
      return this.http.post(`${this.varsUrl?.toString()}/patches/network`, patches, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('vars: no vars url set');
    }
  }
}
