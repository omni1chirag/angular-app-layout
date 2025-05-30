import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { AppThemePreset } from './app.theme.preset';
import { KeycloakService } from '@service/keycloak.service';
import { MessageService } from 'primeng/api';
import { NgxTranslateService } from '@service/ngx-translate.service';
import { HttpResponseInterceptor } from '@interceptor/http-response.interceptor';
import { DialogService } from 'primeng/dynamicdialog';

export function kcFactory(kcService: KeycloakService) {
  return () => kcService.init().catch(err => {
    console.error('Keycloak initialization failed:', err);
  });
}

export function ngxFactory(service: NgxTranslateService) {
  return () => service.init().catch(err => {
    console.error('translate initialization failed:', err);
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
    provideClientHydration(),
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
      useFactory: kcFactory,
      deps: [KeycloakService],
      multi: true,
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



