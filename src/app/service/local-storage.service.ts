import { Injectable, inject } from '@angular/core';
import { UserProfile } from '@interface/user-profile.interface';
import { PlatformService } from './platform.service';
import { LabelValue } from '@interface/common.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private readonly isBrowser: boolean;
  private readonly platformService = inject(PlatformService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  // Generic set
  setItem(key: string, value: unknown): void {
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

  getUserMappedClinics(): LabelValue<string>[] {
    return this.getItem<LabelValue<string>[]>('userClinics') ?? [];
  }

  getCurrentlyUsedClinic(): string | null {
    return this.getItem<string>('currentlyUsedClinic');
  }

  getCurrentUserDoctorId(): string | null {
    return this.getItem<string>('currentUserDoctorId');
  }

  getUserProfile(): UserProfile | null {
    return this.getItem<UserProfile>('userProfile');
  }

  getPatientId(): string | null {
    return this.getItem<string>('activePatientProfile');
  }

  getOrganizationId(): string {
    return this.getUserProfile()?.organization?.organizationId ?? '';
  }

  getloggedinUserId(): string {
    return this.getUserProfile()?.userId ?? '';
  }
}
