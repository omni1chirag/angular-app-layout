import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    private readonly platformId = inject(PLATFORM_ID);

    isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

     /**
    * Executes logic only if the platform is a browser.
    * Usage: this.platformService.onBrowser(() => { ... });
    */
    onBrowser(fn: () => void): void {
        if (this.isBrowser()) {
            fn();
        }
    }

}
