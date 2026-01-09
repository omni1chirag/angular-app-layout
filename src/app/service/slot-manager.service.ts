import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import dayjs from 'dayjs';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { DoctorService } from '@service/doctor.service';
import {
  DateEntry,
  DateSlotData,
  DateRangeMetadata,
  SlotManagerConfig,
  SlotLoadingState,
  SlotLoadRequest,
  SlotLoadResponse,
  SelectedSlotInfo,
  SlotLoadDirection,
  SlotDataMap,
  VisibilityState,
  SetupAndSlotsResponse,
  CalendarSetup,
} from '@interface/doctor-profile.interface';
import { AppointmentType } from '@interface/appointment.interface';

/**
 * Production-ready Slot Manager Service
 * Handles date list generation, dynamic slot loading, memory management, and caching
 */
@Injectable({
  providedIn: 'root'
})
export class SlotManagerService {
  private readonly dateTimeUtil = inject(DateTimeUtilityService);
  private readonly doctorService = inject(DoctorService);

  // ==================== CONFIGURATION ====================
  private readonly defaultConfig: SlotManagerConfig = {
    initialDateRangeDays: 15, // Changed from 60 to 15 days
    loadChunkSize: 15, // Changed from 30 to 15 days
    maxCachedSlots: 30, // Changed from 90 to 30 days
    cacheExpiryMs: 10 * 60 * 1000, // Changed from 15 to 10 minutes
    prefetchThreshold: 5, // Changed from 5 to 3 (load when within 3 tabs)
    debounceMs: 300
  };

  private config: SlotManagerConfig = { ...this.defaultConfig };

  // ==================== STATE MANAGEMENT ====================

  // Date list - always kept in memory for visible range
  private readonly dateList = signal<DateEntry[]>([]);

  // Slot data map - dynamically loaded and cached
  private readonly slotDataMap = signal<SlotDataMap>(new Map());

  readonly calendarSetup = signal<CalendarSetup>(null);

  // Loading state
  private readonly loadingState = signal<SlotLoadingState>({
    isLoading: false,
    direction: null,
    lastLoadTime: 0,
    errorCount: 0,
    retryAfter: null
  });

  // Range metadata
  private readonly rangeMetadata = signal<DateRangeMetadata>({
    startDate: '',
    endDate: '',
    startIndex: 0,
    endIndex: 0,
    totalDates: 0,
    loadedSlotDates: new Set()
  });

  // Selected slot info
  private readonly selectedSlot = signal<SelectedSlotInfo | null>(null);

  // Visibility tracking
  private readonly visibilityState = signal<VisibilityState>({
    visibleDateIndexes: new Set(),
    firstVisibleIndex: 0,
    lastVisibleIndex: 0
  });

  // Absolute boundaries (today's date)
  private readonly absoluteStartDate = this.dateTimeUtil.todayDate();

  // ==================== COMPUTED SIGNALS ====================

  readonly dates = computed(() => this.dateList());
  readonly isLoading = computed(() => this.loadingState().isLoading);
  readonly metadata = computed(() => this.rangeMetadata());
  readonly selectedSlotInfo = computed(() => this.selectedSlot());
  readonly hasLoadedSlots = computed(() => this.slotDataMap().size > 0);

  // ==================== SUBJECTS FOR REACTIVE STREAMS ====================
  private readonly visibilityChange$ = new BehaviorSubject<VisibilityState | null>(null);

  constructor() {
    this.setupVisibilityMonitoring();
    this.setupPeriodicCacheCleanup();
  }

  private setupPeriodicCacheCleanup(): void {
    // Run cleanup every 2 minutes
    setInterval(() => {
      this.clearExpiredCache();
      this.trimOldSlots();
    }, 2 * 60 * 1000);
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize the slot manager with custom configuration
   */
  configure(config: Partial<SlotManagerConfig>): void {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Initialize date list and optionally load slots
   * @param options - Initialization options
   */
  async initialize(options: {
    startDate?: string;
    daysToLoad?: number;
    loadSlots?: boolean;
    clinicId?: string;
    doctorId?: string;
    appointmentId?: string;
  }): Promise<void> {
    const {
      startDate = this.absoluteStartDate,
      daysToLoad = this.config.initialDateRangeDays,
      loadSlots = false,
      clinicId,
      doctorId,
      appointmentId
    } = options;

    // Reset state
    this.reset();

    // Generate initial date list
    const dates = this.generateDateList(startDate, daysToLoad);
    this.dateList.set(dates);

    // Update metadata
    this.updateMetadata();

    // Optionally load slots for initial range
    if (loadSlots && clinicId && doctorId) {
      const startIndex = dates[0].index;
      const endDate = dates[dates.length - 1].date;

      await this.loadSetupAndSlotsForRange({
        clinicId,
        doctorId,
        startDate,
        endDate,
        startIndex,
        appointmentId
      });
    }
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.dateList.set([]);
    this.slotDataMap.set(new Map());
    this.selectedSlot.set(null);
    this.loadingState.set({
      isLoading: false,
      direction: null,
      lastLoadTime: 0,
      errorCount: 0,
      retryAfter: null
    });
    this.rangeMetadata.set({
      startDate: '',
      endDate: '',
      startIndex: 0,
      endIndex: 0,
      totalDates: 0,
      loadedSlotDates: new Set()
    });
  }

  // ==================== DATE LIST MANAGEMENT ====================

  /**
   * Generate a list of date entries
   */
  private generateDateList(startDate: string, days: number): DateEntry[] {
    const dates: DateEntry[] = [];
    const today = this.absoluteStartDate;
    const start = dayjs(startDate);

    // Calculate starting index (days from today)
    const startIndex = Math.max(0, start.diff(dayjs(today), 'day'));

    for (let i = 0; i < days; i++) {
      const currentDate = start.add(i, 'day');
      const dateStr = currentDate.format('YYYY-MM-DD');

      dates.push({
        date: dateStr,
        dayName: currentDate.format('dddd'),
        index: startIndex + i,
        displayDate: currentDate.format('DD MMM YYYY'),
        isToday: dateStr === today,
        isPast: currentDate.isBefore(dayjs(today), 'day')
      });
    }

    return dates;
  }

  /**
   * Extend date list in a direction
   */
  async extendDateList(
    direction: 'previous' | 'next',
    options: {
      clinicId: string;
      doctorId: string;
      appointmentId?: string;
      autoLoadSlots?: boolean;
    }
  ): Promise<void> {
    const currentDates = this.dateList();

    if (currentDates.length === 0) {
      throw new Error('Date list not initialized');
    }

    // Prevent loading if already in progress
    if (this.loadingState().isLoading) {
      console.warn('Load already in progress, skipping');
      return;
    }

    const chunkSize = this.config.loadChunkSize;

    if (direction === 'previous') {
      // Can't go before today
      const firstDate = currentDates[0];
      if (firstDate.date === this.absoluteStartDate) {
        console.warn('Already at earliest date (today)');
        return;
      }

      const newStartDate = dayjs(firstDate.date).subtract(chunkSize, 'day');
      const clampedStartDate = newStartDate.isBefore(dayjs(this.absoluteStartDate))
        ? this.absoluteStartDate
        : newStartDate.format('YYYY-MM-DD');

      const newEndDate = dayjs(firstDate.date).subtract(1, 'day').format('YYYY-MM-DD');
      const newDates = this.generateDateList(
        clampedStartDate,
        dayjs(newEndDate).diff(dayjs(clampedStartDate), 'day') + 1
      );

      // Prepend new dates
      this.dateList.set([...newDates, ...currentDates]);

      // Load slots if requested
      if (options.autoLoadSlots) {
        await this.loadSlotsForRange({
          clinicId: options.clinicId,
          doctorId: options.doctorId,
          startDate: clampedStartDate,
          endDate: newEndDate,
          startIndex: newDates[0].index,
          appointmentId: options.appointmentId
        });
      }
    } else {
      // Extend forward
      const lastDate = currentDates[currentDates.length - 1];
      const newStartDate = dayjs(lastDate.date).add(1, 'day').format('YYYY-MM-DD');
      const newEndDate = dayjs(lastDate.date).add(chunkSize, 'day').format('YYYY-MM-DD');

      const newDates = this.generateDateList(newStartDate, chunkSize);

      // Append new dates
      this.dateList.set([...currentDates, ...newDates]);

      // Load slots if requested
      if (options.autoLoadSlots) {
        await this.loadSlotsForRange({
          clinicId: options.clinicId,
          doctorId: options.doctorId,
          startDate: newStartDate,
          endDate: newEndDate,
          startIndex: newDates[0].index,
          appointmentId: options.appointmentId
        });
      }
    }

    // Update metadata
    this.updateMetadata();

    // Trim if exceeds max cached
    this.trimOldSlots();
  }

  // ==================== SETUP AND SLOT LOADING ====================
  /**
   * Load slots for a date range
   */
  async loadSetupAndSlotsForRange(request: SlotLoadRequest): Promise<DateSlotData[]> {
    // Set loading state
    this.setLoadingState(true, SlotLoadDirection.INITIAL);

    try {
      const response = await this.fetchSetupAndSlots(request);


      // Update Calendar Setup
      this.calendarSetup.set({ slotDuration: response?.slotDuration, doubleBooking: response.doubleBooking, maxBookingsPerSlot: response.maxBookingsPerSlot });

      // Update slot map
      const currentMap = new Map(this.slotDataMap());
      response.slots.forEach(slot => {
        currentMap.set(slot.date, slot);
      });
      this.slotDataMap.set(currentMap);

      // Update loaded dates in metadata
      const metadata = this.rangeMetadata();
      const newLoadedDates = new Set(metadata.loadedSlotDates);
      response.slots.forEach(slot => newLoadedDates.add(slot.date));

      this.rangeMetadata.update(meta => ({
        ...meta,
        loadedSlotDates: newLoadedDates
      }));

      return response.slots;
    } catch (error) {
      this.handleLoadError(error);
      throw error;
    } finally {
      this.setLoadingState(false, null);
    }
  }


  // ==================== SLOT LOADING ====================

  /**
   * Load slots for a date range
   */
  async loadSlotsForRange(request: SlotLoadRequest): Promise<DateSlotData[]> {
    // Set loading state
    this.setLoadingState(true, SlotLoadDirection.INITIAL);

    try {
      const response = await this.fetchSlots(request);

      // Update slot map
      const currentMap = new Map(this.slotDataMap());
      response.slots.forEach(slot => {
        currentMap.set(slot.date, slot);
      });
      this.slotDataMap.set(currentMap);

      // Update loaded dates in metadata
      const metadata = this.rangeMetadata();
      const newLoadedDates = new Set(metadata.loadedSlotDates);
      response.slots.forEach(slot => newLoadedDates.add(slot.date));

      this.rangeMetadata.update(meta => ({
        ...meta,
        loadedSlotDates: newLoadedDates
      }));

      return response.slots;
    } catch (error) {
      this.handleLoadError(error);
      throw error;
    } finally {
      this.setLoadingState(false, null);
    }
  }

  /**
   * Get slots for a specific date
   */
  getSlotsForDate(date: string): DateSlotData | null {
    const slotMap = this.slotDataMap();
    const slots = slotMap.get(date);

    if (!slots) return null;

    // Check cache expiry
    const now = Date.now();
    if (now - slots.lastUpdated > this.config.cacheExpiryMs) {
      console.warn(`Cache expired for date ${date}, removing from cache`);
      // Remove expired slot from map
      const newMap = new Map(slotMap);
      newMap.delete(date);
      this.slotDataMap.set(newMap);

      // Update metadata to remove from loaded dates
      this.rangeMetadata.update(meta => {
        const newLoadedDates = new Set(meta.loadedSlotDates);
        newLoadedDates.delete(date);
        return {
          ...meta,
          loadedSlotDates: newLoadedDates
        };
      });

      return null;
    }

    return slots;
  }

  /**
 * Check and reload expired slots for visible dates
 */
  async reloadExpiredSlotsForVisibleDates(
    clinicId: string,
    doctorId: string,
    appointmentId?: string
  ): Promise<void> {
    const visibleState = this.visibilityState();
    const dates = this.dateList();
    const now = Date.now();

    const expiredDates = this.findExpiredDates(visibleState, dates, now);

    if (expiredDates.length === 0) return;

    console.warn(`Reloading ${expiredDates.length} expired/missing slots`);

    // Group consecutive dates for batch loading
    const sortedDates = [...expiredDates].sort((a, b) => a.localeCompare(b));

    const batches: { start: string; end: string; startIndex: number }[] = [];
    let batchStart = sortedDates[0];
    let batchEnd = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = dayjs(sortedDates[i - 1]);
      const currDate = dayjs(sortedDates[i]);

      if (currDate.diff(prevDate, 'day') === 1) {
        batchEnd = sortedDates[i];
      } else {
        const startIndex = dates.findIndex(d => d.date === batchStart);
        batches.push({ start: batchStart, end: batchEnd, startIndex });
        batchStart = sortedDates[i];
        batchEnd = sortedDates[i];
      }
    }

    const startIndex = dates.findIndex(d => d.date === batchStart);
    batches.push({ start: batchStart, end: batchEnd, startIndex });

    // Load each batch
    for (const batch of batches) {
      try {
        await this.loadSlotsForRange({
          clinicId,
          doctorId,
          startDate: batch.start,
          endDate: batch.end,
          startIndex: batch.startIndex,
          appointmentId
        });
      } catch (error) {
        console.error(`Failed to reload expired slots for ${batch.start} to ${batch.end}:`, error);
      }
    }
  }

  private findExpiredDates(
    visibleState: VisibilityState,
    dates: DateEntry[],
    now: number
  ): string[] {
    const expired: string[] = [];

    visibleState.visibleDateIndexes.forEach(index => {
      const dateEntry = dates[index];
      if (!dateEntry) return;

      const slotData = this.slotDataMap().get(dateEntry.date);

      const isExpired =
        !slotData ||
        now - slotData.lastUpdated > this.config.cacheExpiryMs;

      if (isExpired) {
        expired.push(dateEntry.date);
      }
    });

    return expired;
  }


  /**
   * Check if slots are loaded for a date
   */
  hasSlotsForDate(date: string): boolean {
    return this.slotDataMap().has(date);
  }

  /**
   * Get slot count for a date
   */
  getSlotCount(date: string, type: 'clinic' | 'virtual'): number {
    const slots = this.getSlotsForDate(date);
    if (!slots) return 0;

    return type === 'clinic' ? slots.totalClinicSlots : slots.totalVirtualSlots;
  }

  // ==================== SLOT SELECTION ====================

  /**
   * Select a slot
   */
  selectSlot(info: SelectedSlotInfo): void {
    // Clear previous selection
    if (this.selectedSlot()) {
      this.clearSlotSelection();
    }

    // Mark new slot as booked
    const slotData = this.getSlotsForDate(info.date);
    if (slotData) {
      this.updateSlotBookingState(info, true);
    }

    this.selectedSlot.set(info);
  }

  /**
   * Clear slot selection
   */
  clearSlotSelection(): void {
    const currentSelection = this.selectedSlot();
    if (currentSelection) {
      this.updateSlotBookingState(currentSelection, false);
    }
    this.selectedSlot.set(null);
  }

  /**
   * Update slot booking state
   */
  private updateSlotBookingState(info: SelectedSlotInfo, booked: boolean): void {
    const slotData = this.getSlotsForDate(info.date);
    if (!slotData) return;

    const groupKey = info.appointmentType === 'IN_PERSON'
      ? 'clinicGroupedSlots'
      : 'virtualGroupedSlots';

    const slots = slotData[groupKey]?.[info.dayPart];
    if (!Array.isArray(slots)) return;

    const slot = slots.find(s => s.time === info.time);
    if (slot) {
      slot.booked = booked;

      // Trigger update
      const currentMap = new Map(this.slotDataMap());
      currentMap.set(info.date, { ...slotData });
      this.slotDataMap.set(currentMap);
    }
  }

  /**
   * Restore previous slot selection (for reschedule)
   */
  restoreSlotSelection(
    date: string,
    time: string,
    appointmentType: AppointmentType
  ): void {
    const slotData = this.getSlotsForDate(date);
    if (!slotData) {
      console.warn(`No slot data found for date ${date}`);
      return;
    }

    const groupKey = appointmentType === 'IN_PERSON'
      ? 'clinicGroupedSlots'
      : 'virtualGroupedSlots';

    // Find the day part
    const dayParts = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;
    for (const dayPart of dayParts) {
      const slots = slotData[groupKey]?.[dayPart];
      if (!Array.isArray(slots)) continue;

      const slot = slots.find(s => s.time === time);
      if (slot) {
        this.selectSlot({ date, time, appointmentType, dayPart });
        return;
      }
    }
  }

  // ==================== VISIBILITY TRACKING ====================

  /**
   * Update visibility state
   */
  updateVisibility(visibleIndexes: Set<number>): void {
    if (visibleIndexes.size === 0) return;

    const sorted = Array.from(visibleIndexes).sort((a, b) => a - b);
    const state: VisibilityState = {
      visibleDateIndexes: visibleIndexes,
      firstVisibleIndex: sorted[0],
      lastVisibleIndex: sorted[sorted.length - 1]
    };

    this.visibilityState.set(state);
    this.visibilityChange$.next(state);
  }

  /**
   * Setup visibility monitoring for auto-loading
   */
  private setupVisibilityMonitoring(): void {
    this.visibilityChange$
      .pipe(
        debounceTime(this.config.debounceMs),
        distinctUntilChanged((prev, curr) => {
          if (!prev || !curr) return false;
          return prev.firstVisibleIndex === curr.firstVisibleIndex &&
            prev.lastVisibleIndex === curr.lastVisibleIndex;
        })
      )
      .subscribe(state => {
        if (state) {
          this.checkAndTriggerLoad(state);
        }
      });
  }

  /**
   * Check if we need to load more dates/slots
   */
  private checkAndTriggerLoad(state: VisibilityState): void {
    const dates = this.dateList();
    if (dates.length === 0) return;

    const threshold = this.config.prefetchThreshold;
    const totalDates = dates.length;

    // Check if near start (load previous)
    if (state.firstVisibleIndex <= threshold) {
      console.warn('Near start, should load previous');
      // Emit event or callback for component to handle
    }

    // Check if near end (load next)
    if (totalDates - 1 - state.lastVisibleIndex <= threshold) {
      console.warn('Near end, should load next');
      // Emit event or callback for component to handle
    }
  }

  // ==================== MEMORY MANAGEMENT ====================

  private trimOldSlots(): void {
    const slotMap = this.slotDataMap();
    const maxCached = this.config.maxCachedSlots; // Now 30 instead of 90

    if (slotMap.size <= maxCached) return;

    const dates = this.dateList();
    const visibleState = this.visibilityState();
    const now = Date.now();

    // Create set of visible dates
    const visibleDates = new Set<string>();
    visibleState.visibleDateIndexes.forEach(index => {
      const dateEntry = dates[index];
      if (dateEntry) visibleDates.add(dateEntry.date);
    });

    // Sort entries by last updated time
    const sortedEntries = Array.from(slotMap.entries())
      .sort((a, b) => b[1].lastUpdated - a[1].lastUpdated);

    const newMap = new Map<string, DateSlotData>();
    let keptCount = 0;

    for (const [date, data] of sortedEntries) {
      // Always keep visible dates (even if expired, they'll be reloaded)
      if (visibleDates.has(date)) {
        newMap.set(date, data);
        keptCount++;
        continue;
      }

      // Keep non-expired, non-visible slots up to maxCached
      const isExpired = now - data.lastUpdated > this.config.cacheExpiryMs;

      if (keptCount < maxCached && !isExpired) {
        newMap.set(date, data);
        keptCount++;
      }
      // Expired or excess slots are automatically dropped
    }

    this.slotDataMap.set(newMap);

    // Update metadata
    this.rangeMetadata.update(meta => {
      const newLoadedDates = new Set(
        Array.from(meta.loadedSlotDates).filter(date => newMap.has(date))
      );
      return {
        ...meta,
        loadedSlotDates: newLoadedDates
      };
    });

    console.warn(`Trimmed slots: ${slotMap.size} -> ${newMap.size} (kept ${keptCount})`);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const slotMap = this.slotDataMap();
    const now = Date.now();
    const newMap = new Map<string, DateSlotData>();

    for (const [date, data] of slotMap.entries()) {
      if (now - data.lastUpdated < this.config.cacheExpiryMs) {
        newMap.set(date, data);
      }
    }

    this.slotDataMap.set(newMap);

    // Update metadata
    const metadata = this.rangeMetadata();
    const newLoadedDates = new Set(
      Array.from(metadata.loadedSlotDates).filter(date => newMap.has(date))
    );

    this.rangeMetadata.update(meta => ({
      ...meta,
      loadedSlotDates: newLoadedDates
    }));
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Fetch slots from API
   */
  private async fetchSlots(request: SlotLoadRequest): Promise<SlotLoadResponse> {
    const params = {
      startDate: request.startDate,
      endDate: request.endDate,
      index: request.startIndex,
      ...(request.appointmentId && { appointmentId: request.appointmentId })
    };

    try {
      const response = await firstValueFrom(
        this.doctorService.generateDoctorSlots<DateSlotData[]>(
          request.doctorId,
          request.clinicId,
          params
        ).pipe(
          tap(slots => console.warn(`Loaded ${slots?.length || 0} slots for range ${request.startDate} to ${request.endDate}`)),
          catchError(error => {
            console.error('Error fetching slots:', error);
            return throwError(() => error);
          })
        )
      );

      // Add timestamp to each slot
      const slotsWithTimestamp = response.map(slot => ({
        ...slot,
        lastUpdated: Date.now()
      }));

      return {
        slots: slotsWithTimestamp,
        metadata: {
          totalAvailableSlots: slotsWithTimestamp.reduce((sum, s) => sum + s.totalClinicSlots + s.totalVirtualSlots, 0),
          serverTime: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch slots: ${error.message}`);
    }
  }


  /**
   * Fetch setup and slots from API
   */
  private async fetchSetupAndSlots(request: SlotLoadRequest): Promise<SetupAndSlotsResponse> {
    const params = {
      startDate: request.startDate,
      endDate: request.endDate,
      slotIndex: request.startIndex,
      ...(request.appointmentId && { appointmentId: request.appointmentId })
    };

    try {
      const response = await firstValueFrom(
        this.doctorService.getDoctorSetupAndSlots<SetupAndSlotsResponse>(
          request.doctorId,
          request.clinicId,
          params
        ).pipe(
          catchError(error => {
            console.error('Error fetching slots:', error);
            return throwError(() => error);
          })
        )
      );

      // Add timestamp to each slot
      const slotsWithTimestamp = response?.slots?.map(slot => ({
        ...slot,
        lastUpdated: Date.now()
      }));

      return {
        slots: slotsWithTimestamp,
        maxBookingsPerSlot: response.maxBookingsPerSlot,
        doubleBooking: response.doubleBooking,
        slotDuration: response.slotDuration,
        metadata: {
          totalAvailableSlots: slotsWithTimestamp.reduce((sum, s) => sum + s.totalClinicSlots + s.totalVirtualSlots, 0),
          serverTime: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch slots: ${error.message}`);
    }
  }

  /**
   * Update range metadata
   */
  private updateMetadata(): void {
    const dates = this.dateList();

    if (dates.length === 0) {
      this.rangeMetadata.set({
        startDate: '',
        endDate: '',
        startIndex: 0,
        endIndex: 0,
        totalDates: 0,
        loadedSlotDates: new Set()
      });
      return;
    }

    this.rangeMetadata.update(meta => ({
      ...meta,
      startDate: dates[0].date,
      endDate: dates[dates.length - 1].date,
      startIndex: dates[0].index,
      endIndex: dates[dates.length - 1].index,
      totalDates: dates.length
    }));
  }

  /**
   * Set loading state
   */
  private setLoadingState(isLoading: boolean, direction: SlotLoadDirection | null): void {
    this.loadingState.update(state => ({
      ...state,
      isLoading,
      direction,
      lastLoadTime: isLoading ? Date.now() : state.lastLoadTime
    }));
  }

  /**
   * Handle load error
   */
  private handleLoadError(error: unknown): void {
    this.loadingState.update(state => ({
      ...state,
      errorCount: state.errorCount + 1,
      retryAfter: Date.now() + Math.min(state.errorCount * 1000, 30000) // Exponential backoff
    }));

    console.error('Slot loading error:', error);
  }

  // ==================== PUBLIC UTILITY METHODS ====================

  /**
   * Get date entry by index
   */
  getDateByIndex(index: number): DateEntry | null {
    return this.dateList().find(d => d.index === index) || null;
  }

  /**
   * Get date entry by date string
   */
  getDateByString(date: string): DateEntry | null {
    return this.dateList().find(d => d.date === date) || null;
  }

  /**
   * Get index of date
   */
  getIndexOfDate(date: string): number {
    return this.dateList().findIndex(d => d.date === date);
  }

  /**
   * Check if can load previous
   */
  canLoadPrevious(): boolean {
    const dates = this.dateList();
    if (dates.length === 0) return false;

    return dates[0].date !== this.absoluteStartDate && !this.loadingState().isLoading;
  }

  /**
   * Check if can load next
   */
  canLoadNext(): boolean {
    return !this.loadingState().isLoading;
  }

  /**
   * Get observable for visibility changes
   */
  getVisibilityChanges(): Observable<VisibilityState | null> {
    return this.visibilityChange$.asObservable();
  }
}