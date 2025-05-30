import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, filter, map, mergeMap, shareReplay } from 'rxjs/operators';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class NgxTranslateService {
    private http = inject(HttpClient);
    private translate = inject(TranslateService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private platformService = inject(PlatformService);
    private currentGroup: string | null = null;
    private translationRequests = new Map<string, Observable<any>>();
    private initialized = false;

    async init(): Promise<void> {
        if (this.initialized || !this.platformService.isBrowser()) {
            return Promise.resolve();
        }
        this.initialize();
        this.setupRouteListener();
        this.setupLanguageListener();
        this.initialized = true;
        return Promise.resolve();
    }

    private initialize(): void {
        this.loadTranslations(null, 'en');
    }

    private setupRouteListener(): void {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.activatedRoute),
            map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            }),
            mergeMap(route => route.data),
            map(data => data['translationGroup'] as string)
        ).subscribe(group => this.setGroup(group));
    }

    private setupLanguageListener(): void {
        this.translate.onLangChange.subscribe(
            evt => this.loadTranslations(this.currentGroup, evt.lang)
        );
    }

    private setGroup(group: string | null): void {
        if (this.currentGroup !== group) {
            this.currentGroup = group;
            this.loadTranslations(group, this.translate.currentLang);
        }
    }

    private loadTranslations(group: string | null, lang: string): void{
        forkJoin([
            this.loadGroupTranslations('common', lang),
            group ? this.loadGroupTranslations(group, lang) : of({})
        ]).pipe(
            map(([common, groupTranslations]) => ({ ...common, ...groupTranslations })),
            map(merged => {
                this.translate.setTranslation(lang, merged, true);
                if (lang === this.translate.currentLang) {
                    this.translate.use(lang);
                }
            })
        ).subscribe();
    }
    private loadGroupTranslations(group: string, lang: string): Observable<any> {
        const key = `${group}_${lang}`;
        if(!lang){
            return of({});
        }
        if (!this.translationRequests.has(key)) {
            const url = `./i18n/${group}/${lang}.json`;
            const request$ = this.http.get(url).pipe(
                catchError((error) => {
                    console.error('❌ Failed:', error);
                    return of({});
                }),
                shareReplay(1)
            );
            this.translationRequests.set(key, request$);
        }
        return this.translationRequests.get(key)!;
    }
}