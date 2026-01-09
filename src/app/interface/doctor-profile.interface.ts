import { AbstractControl, ValidationErrors } from "@angular/forms";
import { AppointmentType } from "./appointment.interface";

// ==================== ENUMS ====================
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum SlotLoadDirection {
  PREVIOUS = 'previous',
  NEXT = 'next',
  INITIAL = 'initial'
}

// ==================== CORE INTERFACES ====================
export interface DoctorDetail {
  readonly doctorId?: string;
  readonly fullName?: string;
  readonly title?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly about?: string;
  readonly gender?: string;
  readonly email?: string;
  readonly mobileNumber?: string;
  readonly consultationFee?: number;
  readonly yearOfExperience?: number;
  readonly specialitiesText?: string;
  readonly qualificationsText?: string;
  readonly clinics?: Clinic[];
  readonly paymentModes?: readonly string[];
  readonly insuranceProviders?: readonly string[];
  readonly doubleBooking?: boolean;
  readonly maxBookingsPerSlot?: number;
  aboutTabs: { label: string; content: string }[];
  consultationMode : AppointmentType[];
  consultationCharge: DoctorChargeDTO | null;
}

export interface DoctorChargeDTO {
  newPatient: ChargeDTO | null;
  existingPatient: ChargeDTO | null;
  existingPatientValidityDays: number | null;
}

export interface ChargeDTO {
  inPersonAmount: number | null;
  videoCallAmount: number | null;
}


export interface Clinic {
  readonly clinicId: string;
  readonly clinicName: string;
  readonly address: string;
  readonly city: string;
  readonly pincode: string;
  readonly state: string;
  readonly country: string;
  readonly mobileNumber: string;
  readonly email: string;
  readonly businessAccountId: string;
}

// ==================== NEW SLOT ARCHITECTURE ====================

/**
 * Represents a date entry in the scrollable tab list
 * This is lightweight and always kept in memory for the visible range
 */
export interface DateEntry {
  readonly date: string; // YYYY-MM-DD format
  readonly dayName: string; // Monday, Tuesday, etc.
  readonly index: number; // Absolute index from today (0 = today)
  readonly displayDate: string; // Formatted display date
  readonly isToday: boolean;
  readonly isPast: boolean;
}

/**
 * Slot data for a specific date
 * Loaded on-demand and cached in memory map
 */
export interface DateSlotData {
  readonly date: string;
  readonly totalClinicSlots: number;
  readonly totalVirtualSlots: number;
  readonly clinicGroupedSlots: TimeGroupedSlots;
  readonly virtualGroupedSlots: TimeGroupedSlots;
  readonly lastUpdated: number; // Timestamp for cache invalidation
}

/**
 * Time-grouped slots structure
 */
export interface TimeGroupedSlots {
  readonly Morning?: Slot[];
  readonly Afternoon?: Slot[];
  readonly Evening?: Slot[];
  readonly Night?: Slot[];
}

/**
 * Individual slot information
 */
export interface Slot {
  readonly time: string; // HH:mm format
  booked: boolean;
  readonly slotId?: string; // Unique identifier for the slot
  readonly isBlocked?: boolean; // If slot is blocked by doctor
  readonly currentBookings?: number; // For double booking scenarios
}

// ==================== SLOT MANAGER CONFIGURATION ====================

/**
 * Configuration for the slot management system
 */
export interface SlotManagerConfig {
  readonly initialDateRangeDays: number;
  readonly loadChunkSize: number;
  readonly maxCachedSlots: number;
  readonly cacheExpiryMs: number;
  readonly prefetchThreshold: number;
  readonly debounceMs: number;
}

/**
 * State of the slot loading system
 */
export interface SlotLoadingState {
  isLoading: boolean;
  direction: SlotLoadDirection | null;
  lastLoadTime: number;
  errorCount: number;
  retryAfter: number | null;
}

/**
 * Metadata about the current date range
 */
export interface DateRangeMetadata {
  readonly startDate: string; // First date in visible range
  readonly endDate: string; // Last date in visible range
  readonly startIndex: number; // Index of first date
  readonly endIndex: number; // Index of last date
  readonly totalDates: number; // Total dates in range
  readonly loadedSlotDates: Set<string>; // Dates with loaded slots
}

/**
 * Request parameters for loading slots
 */
export interface SlotLoadRequest {
  readonly clinicId: string;
  readonly doctorId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly startIndex: number;
  readonly appointmentId?: string;
}

/**
 * Metadata returned from the slot loading API
 */
export interface SlotLoadMetadata {
  readonly totalAvailableSlots: number;
  readonly serverTime: string;
}

/**
 * Response from slot loading API
 */
export interface SlotLoadResponse {
  readonly slots: DateSlotData[];
  readonly metadata?: SlotLoadMetadata
}

/**
 * Calendar setup information
 */
export interface CalendarSetup {
  readonly maxBookingsPerSlot: number;
  readonly doubleBooking: boolean;
  readonly slotDuration: number;
}

/**
 * Response that includes both calendar setup and slot information
 */
export interface SetupAndSlotsResponse extends CalendarSetup {
  readonly slots: DateSlotData[];
  readonly metadata?: SlotLoadMetadata;
}


// ==================== BOOKING MANAGEMENT ====================

/**
 * Information about a selected/booked slot
 */
export interface SelectedSlotInfo {
  readonly date: string;
  readonly time: string;
  readonly appointmentType: AppointmentType;
  readonly dayPart: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  readonly slotId?: string;
}

/**
 * Slot availability check result
 */
export interface SlotAvailabilityResult {
  readonly isAvailable: boolean;
  readonly currentBookings: number;
  readonly maxBookings: number;
  readonly reason?: string; // Reason if not available
}

// ==================== VALIDATORS ====================

export class AppointmentValidators {
  static reasonForVisitRequired(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { reasonForVisitRequired: true };
    }
    return null;
  }

  static pastDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  static futureDateValidator(maxDaysInFuture = 365) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const selectedDate = new Date(control.value);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + maxDaysInFuture);

      if (selectedDate > maxDate) {
        return { futureDate: { maxDays: maxDaysInFuture } };
      }
      return null;
    };
  }
}

// ==================== UTILITY TYPES ====================

export type DayPart = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type SlotGroupKey = 'clinicGroupedSlots' | 'virtualGroupedSlots';

/**
 * Helper type for slot map
 */
export type SlotDataMap = Map<string, DateSlotData>;

/**
 * Helper type for visibility tracking
 */
export interface VisibilityState {
  readonly visibleDateIndexes: Set<number>;
  readonly firstVisibleIndex: number;
  readonly lastVisibleIndex: number;
}
