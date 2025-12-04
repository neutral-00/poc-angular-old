import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app';
import { AppRoutingModule } from './app-routing-module';
import { DemoApi } from './component/demo-api/demo-api';
import { apiErrorInterceptor } from './interceptor/api-error-interceptor';

@NgModule({
  declarations: [
    App,
    DemoApi
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // Remove HttpClientModule - replaced by provideHttpClient
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([apiErrorInterceptor]))
  ],
  bootstrap: [App]
})
export class AppModule { }
