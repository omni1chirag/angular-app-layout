import { Injectable } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { interval, map, Observable, takeWhile } from 'rxjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

@Injectable({
    providedIn: 'root'
})
export class DateTimeUtilityService {

    formatDate(baseDate: string | Date): string {
        return dayjs(baseDate).format('YYYY-MM-DD');
    }

    formatTime(baseDate: string | Date): string {
        return dayjs(baseDate).format('hh:mm A');
    }

    formatDateTime(date: string, time: string): string {
        if (!date || !time) {
            return null;
        }
        return dayjs(`${date} ${time}`, "YYYY-MM-DD hh:mm A").format("YYYY-MM-DDTHH:mm:ss");
    }

    formatDateTimeWithAdd(date: string, time: string, minutes: number): string {
        if (!date || !time) {
            return null;
        }
        return dayjs(`${date} ${time}`, "YYYY-MM-DD hh:mm A")
            .add(minutes, "minute")
            .format("YYYY-MM-DDTHH:mm:ss");
    }

    datePlus(baseDate: string | Date, delta: number): string {
        return dayjs(baseDate)
            .startOf('day')
            .add(delta, 'day')
            .format('YYYY-MM-DD');
    }

    dateMinus(baseDate: string | Date, delta: number): string {
        return dayjs(baseDate)
            .startOf('day')
            .subtract(delta, 'day')
            .format('YYYY-MM-DD');
    }

    todayDate(): string {
        return dayjs().startOf('day').format('YYYY-MM-DD');
    }

    convertDateFromString(baseDate: string | Date): string {
        return dayjs(baseDate)
            .format('YYYY-MM-DD');
    }

    convertDateToAgePSP(birth: string | Date | dayjs.Dayjs): string {
        const dob = dayjs.isDayjs(birth) ? birth : dayjs(birth);
        const now = dayjs();

        const years = now.diff(dob, 'year');
        const months = now.diff(dob.add(years, 'year'), 'month');
        const days = now.diff(dob.add(years, 'year').add(months, 'month'), 'day');

        // Handle age formatting
        if (years > 18) return `${years} Y`;
        if (years === 0 && months === 0 && days > 0) return `${days} Day(s)`;
        if (years === 0 && months > 0) return `${months} M ${days} Day(s)`;

        const formattedAge = [];
        if (years) formattedAge.push(`${years} Y`);
        if (months) formattedAge.push(`${months} M`);

        return formattedAge.length > 0 ? formattedAge.join(' ') : '1 Day(s)';
    }


    startCountdown(initialSeconds: number): Observable<string> {
        return interval(1000).pipe(
            map(elapsed => initialSeconds - elapsed),
            takeWhile(remaining => remaining >= 0),
            map(remaining => this.formatTimeDayjs(remaining))
        );
    }

    formatTimeDayjs(seconds: number): string {
        const dur = dayjs.duration(seconds * 1000); // duration expects milliseconds
        const minutes = dur.minutes().toString().padStart(2, '0');
        const secs = dur.seconds().toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    }

    dateFormatUpdate(date: Date | string): string {
        const parsed = dayjs(date);
        return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
    }

    isDateLike(val: unknown): boolean {
        if (!val) return false;
        if (val instanceof Date) return true;
        if (typeof val === 'string') {
            return dayjs(val, [
                'YYYY-MM-DD',
                'MM/DD/YYYY',
                'DD/MM/YYYY',
                'YYYY-MM-DDTHH:mm:ssZ'
            ], true).isValid();
        }

        return false;
    }

    getCurrentDateTime(formate = 'YYYY-MM-DDTHH:mm:ss'): string {
        return dayjs().format(formate)
    }

    getNextDate(day: number): string {
        return dayjs().add(day, 'day').format('DD/MM/YYYY');
    }

    combineDateAndTimeToString(date: Date | string, time: string, formate = 'DD/MM/YYYY'): string {
        const [hours, minutes] = time.split(':').map(Number);
        const combined = dayjs(this.normalizeDateToString(date), formate).hour(hours).minute(minutes).second(0);
        return combined.format('YYYY-MM-DDTHH:mm:ss');
    }

    normalizeDateToString(value: Date | string, formate = 'DD/MM/YYYY'): string {
        if (value instanceof Date && !isNaN(value.getTime())) {
            return dayjs(value).format(formate);
        }

        if (typeof value === 'string') {
            return value;
        }

        // Default fallback (invalid value)
        return '';
    }

    isDateWithinRange(startDateStr: string, endDateStr: string, dateStr: string): boolean {
        if (!startDateStr || !endDateStr || !dateStr) return false;

        const start = dayjs(startDateStr).startOf('day');
        const end = dayjs(endDateStr).endOf('day');
        const target = dayjs(dateStr).startOf('day');

        return target.isBetween(start, end, 'day', '[]'); // '[]' means inclusive
    }

    getDayPartFromDate(dateStr: string | Date): 'Morning' | 'Afternoon' | 'Evening' | 'Night' | null {
        if (!dateStr) return null;

        const date = dayjs(dateStr);
        if (!date.isValid()) return null;

        const hour = date.hour(); // 0–23

        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 21) return 'Evening';
        return 'Night'; // 9 PM–5 AM
    }

    isFutureDate(dateStr: Date | string): boolean {
        if (!dateStr) return false;
        const currentDateTime = dayjs();
        const date = dayjs(dateStr);
        return date.isAfter(currentDateTime);
    }


    isPastDate(dateStr: Date): boolean {
        if (!dateStr) return false;
        const currentDateTime = dayjs();
        const date = dayjs(dateStr);
        return date.isBefore(currentDateTime);
    }

    isWithinNextHour(dateStr: string | Date): boolean {
        if (!dateStr) return false;
        const date = dayjs(dateStr);
        const oneHourAgo = dayjs().add(1, 'hour');
        return date.isAfter(dayjs()) && date.isBefore(oneHourAgo);
    }

    isWithinLast15Minutes(dateStr: string | Date): boolean {
        if (!dateStr) return false;
        const date = dayjs(dateStr);
        const fifteenMinutesAgo = dayjs().subtract(15, 'minutes');
        return date.isAfter(dayjs()) && date.isBefore(fifteenMinutesAgo);
    }

    getDaysBetween(startDate: string | Date | Dayjs, endDate: string | Date | Dayjs): number {
        const start = startDate ? dayjs(startDate) : dayjs();
        const end = dayjs(endDate);

        if (!start.isValid() || !end.isValid()) {
            throw new Error('Invalid date provided');
        }

        return end.diff(start, 'day');
    }

    convertInDayjs(date: string): Dayjs {
        return dayjs(date);
    }
}