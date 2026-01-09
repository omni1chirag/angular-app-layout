import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpResponseInterceptor } from '@interceptor/http-response.interceptor';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { KeycloakService } from '@service/keycloak.service';
import { NgxTranslateService } from '@service/ngx-translate.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from './app.routes';
import { AppThemePreset } from './app.theme.preset';
import { isPlatformBrowser } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withEnabledBlockingInitialNavigation()
    ),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([HttpResponseInterceptor])),
    providePrimeNG({
      theme: {
        preset: AppThemePreset,
        options: { darkModeSelector: '.app-dark' },
      },
    }),
    provideTranslateService({ defaultLanguage: 'en' }),

    provideAppInitializer(async () => {
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        const translate = inject(TranslateService);
        translate.setDefaultLang('en');

        const kc = inject(KeycloakService);
        const svc = inject(NgxTranslateService);

        await kc
          .init()
          .catch((err) =>
            console.error('Keycloak initialization failed:', err)
          );
        await svc
          .init()
          .catch((err) =>
            console.error('Translate initialization failed:', err)
          );
      }
    }),
    MessageService,
    DialogService,
    ConfirmationService,
  ],
};
