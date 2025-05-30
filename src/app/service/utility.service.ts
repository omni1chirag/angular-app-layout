import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { interval, map, Observable, takeWhile } from 'rxjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(customParseFormat);

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

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

  getFormValidationErrors(form: AbstractControl): number {
        let errorCount = 0;

        if (form instanceof FormGroup || form instanceof FormArray) {
            Object.keys(form.controls).forEach(key => {
                const control = form.get(key);
                if (control) {
                    errorCount += this.getFormValidationErrors(control);
                }
            });
        } else if (form instanceof FormControl && form.errors) {
            errorCount += Object.keys(form.errors).length;
        }

        return errorCount;
    }

  convertDateToAgePSP(birth: string | Date | dayjs.Dayjs): string {
    if (!dayjs.isDayjs(birth)) {
      birth = dayjs(birth);
    }

    const now = dayjs();
    let years = now.diff(birth, 'year');
    birth = birth.add(years, 'year');

    let months = now.diff(birth, 'month');
    birth = birth.add(months, 'month');

    let days = now.diff(birth, 'day');

    if (years === 0 && months === 0 && days > 0) {
      return `${days} Day(s)`;
    } else if (years === 0 && months > 0) {
      return `${months} M ${Math.abs(days)} Day(s)`;
    } else if (years <= 18) {
      return (years === 0 && months === 0 && days === 0)
        ? '1 Day(s)'
        : `${years ? years + ' Y ' : ''}${months ? months + ' M' : ''}`;
    } else {
      return `${years} Y`;
    }
  }

  startCountdown(initialSeconds: number): Observable<string> {
    return interval(1000).pipe(
      map(elapsed => initialSeconds - elapsed),
      takeWhile(remaining => remaining >= 0),
      map(this.formatTime)
    );
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const padZero = (num: number): string => {
      return num < 10 ? `0${num}` : `${num}`;
    }
    return `${padZero(minutes)}:${padZero(secs)}`;
  }

  normalizeDateToString(value: Date | string): string {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return dayjs(value).format('DD/MM/YYYY');
    }
  
    if (typeof value === 'string') {
      return value;
    }
  
    // Default fallback (invalid value)
    return '';
  }
  combineDateAndTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const combined =  dayjs(this.normalizeDateToString(date), 'DD/MM/YYYY').hour(hours).minute(minutes).second(0);
    return combined.format('YYYY-MM-DDTHH:mm:ss');
  }

  getOrganizationId() {
    const userProfile = localStorage.getItem('userProfile');

    if (!userProfile) {
      console.warn('User profile not found in localStorage.');
      return '';
    }

    try {
      const parsedProfile = JSON.parse(userProfile);
      return parsedProfile?.organization?.organizationId || '';
    } catch (error) {
      console.error('Error parsing user profile:', error);
      return '';

    }
  }

  separateDateAndTime(datetime: string): { date: Date; time: string } {
    const parsed = dayjs(datetime);
    const date = parsed.startOf('day').toDate();
    const time = parsed.format('HH:mm');
    return { date, time };
  }
}


