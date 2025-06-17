import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { NgxPermissionsModule } from 'ngx-permissions';
import { provideToastr } from 'ngx-toastr';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyConfigModule } from 'app/formly-config';
import { CoreModule } from './core/core.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  apiInterceptor,
  BASE_URL,
  baseUrlInterceptor,
  errorInterceptor,
  loggingInterceptor,
  noopInterceptor,
  settingsInterceptor,
  StartupService,
  tokenInterceptor,
  TranslateLangService,
} from '@core';
import { environment } from '@env/environment';
import { ThemeModule } from './theme/theme.module';
import { SharedModule } from './shared/shared.module';
import { RoutesModule } from './routes/routes.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

// Required for AOT compilation
function TranslateHttpLoaderFactory(http: HttpClient) {
  console.log(http);
  return new TranslateHttpLoader(http, 'i18n/', '.json');
}

// Http interceptor providers in outside-in order
const interceptors = [
  noopInterceptor,
  baseUrlInterceptor,
  settingsInterceptor,
  tokenInterceptor,
  apiInterceptor,
  errorInterceptor,
  loggingInterceptor,
];
@NgModule({
  declarations: [AppComponent],
  imports: [

    CoreModule,
    ThemeModule,
    SharedModule,
    RoutesModule,
    FormlyConfigModule.forRoot(),
    NgxPermissionsModule.forRoot(),
    BrowserAnimationsModule,
    BrowserModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule,
  ],

  providers: [
    { provide: BASE_URL, useValue: environment.baseUrl },
    provideAppInitializer(() => inject(TranslateLangService).load()),
    provideAppInitializer(() => inject(StartupService).load()),
    provideHttpClient(withInterceptors(interceptors)),
    provideAnimationsAsync(),
    provideToastr(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    // ==================================================
    // 👇 ❌ Remove it in the realworld application
    //
    // { provide: LoginService, useClass: FakeLoginService },
    //
    // ==================================================
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
