import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlatformService } from './platform.service';
import { MenuItem } from '@interface/common.interface';
import { LocalStorageService } from './local-storage.service';


@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private readonly platform = inject(PlatformService);
    private readonly localStorageService = inject(LocalStorageService);

    private readonly menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
    menuItems$ = this.menuItemsSubject.asObservable();

    constructor(
    ) {
        this.initializeMenuItems();
    }


    private initializeMenuItems() {
        const initialItems = this.getInitialMenuItems();
        this.menuItemsSubject.next(initialItems);
    }

    private getInitialMenuItems() {
        if (this.platform.isBrowser()) {
            const stored = this.localStorageService.getItem<MenuItem[]>('menuItems');
            return stored ?? [];
        }
        return [];
    }

    updateMenuItems(items: MenuItem[]): void {
        if (this.platform.isBrowser()) {
            this.localStorageService.setItem('menuItems', items);
        }
        this.menuItemsSubject.next(items);
    }
}
