import { effect, inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from './local-storage.service';
import { PlatformService } from './platform.service';
import { NgxTranslateService } from './ngx-translate.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MultiLangService {
  private readonly isBrowser: boolean;
  private readonly translateService = inject(TranslateService);
  private readonly platformService = inject(PlatformService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly ngxTranslateService = inject(NgxTranslateService);

  private readonly loadedModules = new Set<string>();
  private readonly modules = new Map<string, string[]>([
    [
      'patient',
      [
        'PATIENT',
        'INSURANCE',
        'APPOINTMENT',
        'DOCUMENT',
        'VITALS',
        'MEDICATION',
        'IMMUNIZATION',
      ],
    ],
    ['setup', ['CARE_PLAN_SETUP', 'NOTIFICATION']],
    [
      'summary',
      [
        'MEDICATION',
        'DIAGNOSIS',
        'LAB',
        'ALLERGY',
        'IMMUNIZATION',
        'DOCUMENT',
        'CHARTING',
        'VITALS',
        'CARE_PLAN',
        'APPOINTMENT',
        'PAST_MEDICAL_HISTORY',
        'SURGICAL_HISTORY',
        'FAMILY_HISTORY',
        'SOCIAL_HISTORY',
      ],
    ],
  ]);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();

    if (this.isBrowser) {
      const savedLanguage =
        this.localStorageService.getItem<string>('languageSignal') || 'en';
      this.languageSignal.set(savedLanguage);

      this.translateService.setDefaultLang('en');
      this.translateService.use(this.languageSignal());

      effect(() => {
        this.localStorageService.setItem(
          'languageSignal',
          this.languageSignal()
        );
        console.debug('Updated languageSignal:', this.languageSignal());
      });
    }
  }

  languageSignal = signal<string>('en');

  updateLanguageSignal(language: string): void {
    if (!this.isBrowser) return;

    const validLanguages = ['en', 'hi', 'gu'];
    this.languageSignal.set(
      validLanguages.includes(language) ? language : 'en'
    );

    this.localStorageService.setItem('languageSignal', this.languageSignal());
    this.translateService.use(this.languageSignal());
  }

  async getTranslateMsgFromKey(
    key: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    if (!key) return null;

    const moduleName = this.findModuleByKey(key);

    if (moduleName && !this.loadedModules.has(moduleName)) {
      await firstValueFrom(
        this.ngxTranslateService.preloadTranslations(
          [moduleName],
          this.translateService.currentLang
        )
      );
      this.loadedModules.add(moduleName);
    }

    try {
      const translatedMsg = await firstValueFrom(
        this.translateService.get(key, params)
      );

      return translatedMsg && translatedMsg !== key ? translatedMsg : key;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  }

  async fetchLocalizedLabel(
    key: string,
    params?: Record<string, unknown>
  ): Promise<string> {
    const message = await this.getTranslateMsgFromKey(key, params);
    return message ?? key;
  }

  private findModuleByKey(key: string): string | null {
    const prefix = key.split('.')[0];

    for (const [moduleName, prefixes] of this.modules.entries()) {
      if (prefixes.includes(prefix)) {
        return moduleName;
      }
    }
    return null;
  }
}
