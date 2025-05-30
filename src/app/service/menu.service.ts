import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlatformService } from './platform.service';


@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private menuItemsSubject = new BehaviorSubject<any[]>([]);
    menuItems$ = this.menuItemsSubject.asObservable();

    constructor(private platform: PlatformService) {
        this.initializeMenuItems();
    }


    private initializeMenuItems() {
        const initialItems = this.getInitialMenuItems();
        this.menuItemsSubject.next(initialItems);
    }

    private getInitialMenuItems() {
        if (this.platform.isBrowser()) {
            const stored = localStorage.getItem('menuItems');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    }


    updateMenuItems(items: any[]) {
        if (this.platform.isBrowser()) {
            localStorage.setItem('menuItems', JSON.stringify(items));
        }
        this.menuItemsSubject.next(items);               
    }
}
