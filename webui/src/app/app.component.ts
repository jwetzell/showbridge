import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { get } from 'lodash-es';
import { filter } from 'rxjs';
import { ImportConfigComponent } from './components/import-config/import-config.component';
import { MIDIInfoDialogComponent } from './components/midi-info-dialog/midi-info-dialog.component';
import { ConfigState } from './models/config.models';
import { MIDIStatus } from './models/events.model';
import { ConfigService } from './services/config.service';
import { CopyService } from './services/copy.service';
import { EventService } from './services/event.service';
import { SchemaService } from './services/schema.service';
import { SettingsService } from './services/settings.service';
import { VarsService } from './services/vars.service';
import { downloadJSON } from './utils/utils';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  currentlyShownConfigState?: ConfigState;

  shouldRedirect: boolean = false;

  constructor(
    public configService: ConfigService,
    public eventService: EventService,
    public schemaService: SchemaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private copyService: CopyService,
    public settingsService: SettingsService,
    private varsService: VarsService
  ) {
    // NOTE(jwetzell): allows configstate to be updated via code
    this.configService.currentlyShownConfigState.subscribe((currentConfig) => {
      if (currentConfig) {
        this.currentlyShownConfigState = currentConfig;
      }
    });

    // NOTE(jwetzell): notify user when currently copied obect is updated
    this.copyService.currentCopyObject.pipe(filter((val) => !!val)).subscribe((object) => {
      this.snackBar.open(`${object?.type} copied...`, 'Dismiss', {
        duration: 3000,
      });
    });
  }

  configUpdated() {
    console.log('configUpdated');
    console.log(this.currentlyShownConfigState);
    if (this.currentlyShownConfigState?.config) {
      this.configService.pushConfigState(this.currentlyShownConfigState.config, false, true);
    }
  }

  applyConfig() {
    // TODO(jwetzell): try to figure how to get rid of this
    if (this.settingsService.isDummySite) {
      this.snackBar.open('Dummy site nothing to save to!', 'Save', {
        duration: 3000,
      });
      return;
    }

    // NOTE(jwetzell): update config via HTTP endpoint
    if (this.currentlyShownConfigState) {
      this.configService.uploadConfig(this.currentlyShownConfigState.config).subscribe((resp) => {
        if (this.currentlyShownConfigState) {
          this.configService.setCurrentlyLiveConfigState(this.currentlyShownConfigState);

          // NOTE(jwetzell): check for a updated HTTP port
          const newHttpPort = get(this.currentlyShownConfigState.config, 'http.params.port');

          if (newHttpPort && newHttpPort !== parseInt(location.port)) {
            if (this.settingsService.baseUrl === window.location.href) {
              this.shouldRedirect = true;
            }
          }

          const configAppliedSnackBar = this.snackBar.open('Config applied successfully!', 'Dismiss', {
            duration: 3000,
          });

          configAppliedSnackBar.afterOpened().subscribe((value) => {
            // NOTE(jwetzell): reload right away if not HTTP port change
            if (!this.shouldRedirect) {
              this.eventService.reload();
            }
          });

          configAppliedSnackBar.afterDismissed().subscribe((value) => {
            if (this.shouldRedirect) {
              // NOTE(jwetzell): notify user that we are redirecting
              this.snackBar
                .open('HTTP port changed redirecting...', 'Redirect', {
                  duration: 3000,
                })
                .afterDismissed()
                .subscribe((value) => {
                  location.port = `${newHttpPort}`;
                });
            }
          });
        }
      });
    } else {
      console.error('pending config is null');
    }
  }

  importConfig() {
    const dialogRef = this.dialog.open(ImportConfigComponent, {
      width: '400px',
      height: '400px',
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result) => !!result && result !== ''))
      .subscribe((result) => {
        if (this.currentlyShownConfigState) {
          this.currentlyShownConfigState.config = result;
        }
        this.configUpdated();
      });
  }

  downloadConfig() {
    if (this.currentlyShownConfigState?.config) {
      downloadJSON(this.currentlyShownConfigState?.config, 'config.json');
    } else {
      this.snackBar.open('No config to download.', 'Dismiss', {
        duration: 3000,
      });
    }
  }

  // NOTE(jwetzell): load configstate from revisions history
  loadConfigState(configState: ConfigState) {
    this.configService.updateCurrentlyShownConfig(configState);
  }

  openMIDIInfo(midiProtocolStatus: MIDIStatus) {
    this.dialog.open(MIDIInfoDialogComponent, {
      data: midiProtocolStatus,
      width: '50%',
      height: '50%',
    });
  }
}
