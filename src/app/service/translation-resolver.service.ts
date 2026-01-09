import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { NgxTranslateService } from './ngx-translate.service';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class TranslationResolver implements Resolve<boolean> {
  private readonly ngxTranslate = inject(NgxTranslateService);
  private readonly translate = inject(TranslateService);
  private readonly platformService = inject(PlatformService);

  private readonly RESOLVE_TIMEOUT_MS = 5000;

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    if(!this.platformService.isBrowser()){
      return of(true);
    }
    const groupData = route.data?.['translationGroup'] as string | null;
    const groups = groupData ? groupData.split(',').map((g) => g.trim()) : null;

    const lang =
      this.translate.currentLang || this.translate.getDefaultLang() || 'en';

    return this.ngxTranslate.preloadTranslations(groups, lang).pipe(
      timeout(this.RESOLVE_TIMEOUT_MS),
      map(() => true),
      catchError(() => of(true))
    );
  }
}
