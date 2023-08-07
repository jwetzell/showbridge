import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ActionFormComponent } from './components/action-form/action-form.component';
import { ActionComponent } from './components/action/action.component';
import { ConfigComponent } from './components/config/config.component';
import { ParamsSchemaFormComponent } from './components/params-schema-form/params-schema-form.component';
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
    ParamsSchemaFormComponent,
    TriggerFormComponent,
    ActionFormComponent,
    TransformFormComponent,
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
