import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpResponseInterceptor } from '@interceptor/http-response.interceptor';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxTranslateService } from '@service/ngx-translate.service';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AppThemePreset } from './app.theme.preset';

export function ngxFactory(service: NgxTranslateService) {
  return () => service.init().catch(err => {
    console.error('translate initialization failed:', err);
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([
      HttpResponseInterceptor
    ])),
    providePrimeNG({
      theme: {
        preset: AppThemePreset,
        options: { darkModeSelector: '.app-dark' }
      }
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => () => {
        translate.setDefaultLang('en');
      },
      deps: [TranslateService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: ngxFactory,
      deps: [NgxTranslateService],
      multi: true,
    },
    MessageService,
    DialogService
  ]
};
