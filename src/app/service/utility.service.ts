import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { KeycloakService } from './keycloak.service';
import { HttpParams } from '@angular/common/http';
import { DateTimeUtilityService } from './date-time-utility.service';


@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private readonly keycloakService = inject(KeycloakService);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService)


  markControlsAsDirtyAndTouched(control: AbstractControl): void {
    if (control.invalid) {
      control.markAsDirty();
      control.markAsTouched();
      control.updateValueAndValidity();
    }

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(childControl =>
        this.markControlsAsDirtyAndTouched(childControl)
      );
    } else if (control instanceof FormArray) {
      control.controls.forEach(childControl =>
        this.markControlsAsDirtyAndTouched(childControl)
      );
    }
  }

  isAdminUser(): boolean {
    const userRole = this.keycloakService.userRole;
    return 'admin' == userRole;
  }

  setTableWhereClause(filters: Record<string, { value: unknown }>, params: HttpParams): HttpParams {
    if (!filters) {
      return params;
    }
    const appendParam = (p: HttpParams, key: string, value: unknown) => {
      if (this.dateTimeUtilityService.isDateLike(value)) {
        return p.append(key, this.dateTimeUtilityService.dateFormatUpdate(value as string | Date));
      }
      return p.append(key, value as string);
    };

    Object.keys(filters)?.forEach((key) => {
      const raw = filters[key]?.value;

      if (raw === undefined || raw === null || raw === '') return;
      if (raw instanceof Set) {
        raw.forEach((item) => {
          if (item === undefined || item === null || item === '') return;
          params = appendParam(params, key, item);
        });
        return;
      }
      if (Array.isArray(raw)) {
        if (raw.length === 0) return;
        raw.forEach((item) => {
          if (item === undefined || item === null || item === '') return;
          params = appendParam(params, key, item);
        });
        return;
      }
      params = appendParam(params, key, raw);
    });
    return params;
  }

}


