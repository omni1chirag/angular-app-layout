import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly isBrowser: boolean;
  private readonly platformService = inject(PlatformService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  setItem(key: string, value: unknown): void {
    if (this.isBrowser) {
      try {
        const serialized = JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
      } catch (error) {
        console.error(`Error saving to sessionStorage (key: ${key})`, error);
      }
    }
  }

  getItem<T>(key: string): T | null {
    if (this.isBrowser) {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) as T : null;
      } catch (error) {
        console.error(`Error reading from sessionStorage (key: ${key})`, error);
      }
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.isBrowser) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing from sessionStorage (key: ${key})`, error);
      }
    }
  }

  clear(): void {
    if (this.isBrowser) {
      try {
        sessionStorage.clear();
      } catch (error) {
        console.error('Error clearing sessionStorage', error);
      }
    }
  }

  hasKey(key: string): boolean {
    return this.isBrowser && sessionStorage.getItem(key) !== null;
  }
}
