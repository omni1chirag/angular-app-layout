import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';
import Inputmask from 'inputmask';


@Directive({
  selector: '[dateMask]'
})
export class DateMaskDirective implements AfterViewInit {
constructor(private el: ElementRef) { }

  ngAfterViewInit() {
     new Inputmask( this.getDateMask() ).mask( this.getHTMLInput() );
  }

  getHTMLInput(): HTMLInputElement {
    return this.el.nativeElement.querySelector('input');
  }

  getDateMask(): string {
    const el: HTMLElement = this.el.nativeElement;

    const format = el.getAttribute('dateformat');
    const timeOnly = el.hasAttribute('timeonly');
    const showTime = el.hasAttribute('showtime');
    const isRange = el.hasAttribute('selectionmode') && el.getAttribute('selectionmode') === 'range';
    if(timeOnly) {
      return '99:99';
    } else if(showTime) {
      return '99/99/9999 99:99';
    } else if(format === 'mm/yy') {
      return '99/9999';
    } else if(isRange) {
      return '99/99/9999 - 99/99/9999';
    } else {
      return '99/99/9999';
    }
  }

  @HostListener('keydown.enter', ['$event'])
  onEnterPress(event: KeyboardEvent) {
    const inputElement = this.getHTMLInput();
    const enteredDate = inputElement.value.trim();

    if (!this.isValidDate(enteredDate)) {
      inputElement.value="";
      event.preventDefault();
    }
  }

  isValidDate(dateStr: string): boolean {
    const format = this.getDateMask();

    if (format === '99/99/9999') {
      return this.validateSingleDate(dateStr);
    } else if (format === '99/9999') {
      return /^\d{2}\/\d{4}$/.test(dateStr);
    } else if (format === '99:99') {
      return /^\d{2}:\d{2}$/.test(dateStr);
    } else if (format === '99/99/9999 99:99') {
      const [datePart, timePart] = dateStr.split(' ');
      return this.validateSingleDate(datePart) && /^\d{2}:\d{2}$/.test(timePart);
    } else if (format === '99/99/9999 - 99/99/9999') {
      return this.validateDateRange(dateStr);
    }

    return false;
  }

  validateSingleDate(dateStr: string): boolean {
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(datePattern);

    if (!match) return false;

    const [, month, day, year] = match.map(Number);

    return this.isValidMonthDay(month, day, year);
  }

  validateDateRange(dateRangeStr: string): boolean {
    const rangePattern = /^(\d{2})\/(\d{2})\/(\d{4}) - (\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateRangeStr.match(rangePattern);

    if (!match) return false;

    const [, month1, day1, year1, month2, day2, year2] = match.map(Number);

    if (!this.isValidMonthDay(month1, day1, year1) || !this.isValidMonthDay(month2, day2, year2)) {
      return false;
    }

    const date1 = new Date(year1, month1 - 1, day1);
    const date2 = new Date(year2, month2 - 1, day2);

    return date2 >= date1; // Second date must not be earlier than the first
  }

  isValidMonthDay(month: number, day: number, year: number): boolean {
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const maxDays = new Date(year, month, 0).getDate();
    return day <= maxDays;
  }
}
