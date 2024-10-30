import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';
import { CdkMenuModule } from '@angular/cdk/menu';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TimeagoModule } from 'ngx-timeago';
import { AppComponent } from './app.component';
import { ActionComponent } from './components/action/action.component';
import { ArrayFormComponent } from './components/array-form/array-form.component';
import { ClipboardDialogComponent } from './components/clipboard-dialog/clipboard-dialog.component';
import { ConfigComponent } from './components/config/config.component';
import { ImportJSONComponent } from './components/import-json/import-json.component';
import { MessageTypeComponent } from './components/message-type/message-type.component';
import { MIDIInfoDialogComponent } from './components/midi-info-dialog/midi-info-dialog.component';
import { ParamsFormComponent } from './components/params-form/params-form.component';
import { PatchEditorComponent } from './components/patch-editor/patch-editor.component';
import { TransformComponent } from './components/transform/transform.component';
import { TriggerComponent } from './components/trigger/trigger.component';
@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    TransformComponent,
    ActionComponent,
    TriggerComponent,
    MessageTypeComponent,
    ParamsFormComponent,
    ArrayFormComponent,
    ImportJSONComponent,
    MIDIInfoDialogComponent,
    ClipboardDialogComponent,
    PatchEditorComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatInputModule,
    MatSnackBarModule,
    MatFormFieldModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragHandle,
    CdkDragPreview,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TimeagoModule.forRoot(),
    CdkMenuModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
