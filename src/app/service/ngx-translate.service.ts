import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class NgxTranslateService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);
  private readonly platformService = inject(PlatformService);

  private readonly translationRequests = new Map<string, Observable<object>>();
  private readonly loadedGroupsByLang = new Map<string, Set<string>>();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized || !this.platformService.isBrowser()) {
      return;
    }
    this.initialize();
    this.setupLanguageListener();
    this.initialized = true;
  }

  private initialize(): void {
    this.loadTranslations([], this.translate.currentLang || 'en');
  }

  private setupLanguageListener(): void {
    this.translate.onLangChange.subscribe((evt) =>
      this.loadTranslations([...this.getLoadedGroups(evt.lang)], evt.lang)
    );
  }

  private getLoadedGroups(lang = 'en'): Set<string> {
    if (!this.loadedGroupsByLang.has(lang)) {
      this.loadedGroupsByLang.set(lang, new Set());
    }
    return this.loadedGroupsByLang.get(lang);
  }

  private setLoadedGroup(group: string, lang = 'en'): void {
    const set = this.getLoadedGroups(lang);
    set.add(group);
  }

  public preloadTranslations(
    groups: string[] | null,
    lang: string
  ): Observable<void> {
    if (!groups || groups.length === 0) {
      return of(void 0);
    }
    const groupsToLoad = groups.filter(
      (g) => !this.getLoadedGroups(lang).has(g)
    );
    if (groupsToLoad.length === 0) {
      return of(void 0);
    }
    const calls = [
      this.loadGroupTranslations('common', lang),
      ...groupsToLoad.map((g) => this.loadGroupTranslations(g, lang)),
    ];

    return forkJoin(calls).pipe(
      map((results) =>
        results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
      ),
      tap((merged) => {
        this.translate.setTranslation(lang, merged, true);
        this.setLoadedGroup('common', lang);
        groupsToLoad.forEach((g) => this.setLoadedGroup(g, lang));
      }),
      map(() => void 0)
    );
  }

  private loadTranslations(groups: string[] | null, lang: string): void {
    const groupsToLoad = groups
      ? groups.filter((g) => !this.getLoadedGroups(lang).has(g))
      : [];

    const calls = [
      this.loadGroupTranslations('common', lang),
      ...groupsToLoad.map((g) => this.loadGroupTranslations(g, lang)),
    ];

    forkJoin(calls)
      .pipe(
        map((results) =>
          results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        ),
        tap((merged) => {
          this.translate.setTranslation(lang, merged, true);
          if (lang === this.translate.currentLang) {
            this.translate.use(lang);
          }
          this.setLoadedGroup('common', lang);
          groupsToLoad.forEach((g) => this.setLoadedGroup(g, lang));
        })
      )
      .subscribe({
        error: (err) => console.error('Error merging translations:', err),
      });
  }

  private loadGroupTranslations(
    group: string,
    lang: string
  ): Observable<object> {
    const key = `${group}_${lang}`;
    if (!lang) {
      return of({});
    }
    if (!this.translationRequests.has(key)) {
      const url = `./i18n/${group}/${lang}.json`;
      const request$ = this.http.get(url).pipe(
        catchError((error) => {
          console.error('Failed:', error);
          return of({});
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.translationRequests.set(key, request$);
    }
    const resp = this.translationRequests.get(key);
    return resp ?? of({});
  }
}
