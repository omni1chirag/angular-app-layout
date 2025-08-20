import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Generic set
  setItem(key: string, value: any): void {
    if (!this.isBrowser) return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key})`, error);
    }
  }

  // Generic get
  getItem<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;

      // Try parsing JSON. If it fails, return raw value
      try {
        return JSON.parse(item) as T;
      } catch {
        // Return raw value (like string or number)
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key})`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing from localStorage (key: ${key})`, error);
      }
    }
  }

  clear(): void {
    if (this.isBrowser) {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage', error);
      }
    }
  }

  hasKey(key: string): boolean {
    return this.isBrowser && localStorage.getItem(key) !== null;
  }

  // === Application-specific accessors ===

  getUserMappedClinics(): string[] {
    return this.getItem<string[]>('userClinics') ?? [];
  }

  getCurrentlyUsedClinic(): string | null {
    return this.getItem<string>('currentlyUsedClinic');
  }

  getCurrentUserDoctorId(): string | null {
    return this.getItem<string>('currentUserDoctorId');
  }

  getUserProfile(): any | null {
    return this.getItem<any>('userProfile');
  }

  getOrganizationId(): string {
    return this.getUserProfile()?.organization?.organizationId ?? '';
  }

  getloggedinUserId(): string {
    return this.getUserProfile()?.userId ?? '';
  }
}
