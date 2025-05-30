import { isPlatformBrowser } from '@angular/common';
import { effect, Inject, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class MultiLangService {
  private isBrowser: boolean;

  constructor(private translateService: TranslateService,@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const savedLanguage = localStorage.getItem('languageSignal') || 'en';
      this.languageSignal.set(savedLanguage);

      this.translateService.setDefaultLang('en');
      this.translateService.use(this.languageSignal());

      effect(() => {
        localStorage.setItem('languageSignal', this.languageSignal());
        console.log('Updated languageSignal:', this.languageSignal());
      });
    }
  }

  languageSignal = signal<string>('en');

  updateLanguageSignal(language: string) {
    if (!this.isBrowser) return;

    const validLanguages = ['en', 'hi', 'gu'];
    this.languageSignal.set(validLanguages.includes(language) ? language : 'en');

    localStorage.setItem('languageSignal', this.languageSignal());
    this.translateService.use(this.languageSignal());
  }

  getTranslateMsgFromKey(key): Promise<string> {
    return new Promise((resolve) => {
      if (!key) {
        resolve(null);
      }
      this.translateService.get(key).subscribe({
        next: (translatedMsg: string) => { resolve(translatedMsg) },
        error: (error: any) => {
          console.log(error)
          resolve(null)
        }
      })
    })
  }
}
