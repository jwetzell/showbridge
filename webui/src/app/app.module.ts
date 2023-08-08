import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ActionFormComponent } from './components/action-form/action-form.component';
import { ActionComponent } from './components/action/action.component';
import { ConfigComponent } from './components/config/config.component';
import { ImportConfigComponent } from './components/import-config/import-config.component';
import { ParamsFormComponent } from './components/params-form/params-form.component';
import { ProtocolFormComponent } from './components/protocol-form/protocol-form.component';
import { ProtocolComponent } from './components/protocol/protocol.component';
import { TransformFormComponent } from './components/transform-form/transform-form.component';
import { TransformComponent } from './components/transform/transform.component';
import { TriggerFormComponent } from './components/trigger-form/trigger-form.component';
import { TriggerComponent } from './components/trigger/trigger.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    TransformComponent,
    ActionComponent,
    TriggerComponent,
    ProtocolComponent,
    TriggerFormComponent,
    ActionFormComponent,
    TransformFormComponent,
    ProtocolFormComponent,
    ParamsFormComponent,
    ImportConfigComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatTreeModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatInputModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatCheckboxModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragHandle,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
