import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    constructor(@Inject(PLATFORM_ID) private platformId: any) { }

    isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

}
