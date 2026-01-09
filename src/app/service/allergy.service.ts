import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Allergy, AllergyData } from '@interface/allergy.interface';
import { BehaviorSubject, catchError, finalize, Observable, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',

})
@Injectable()
export class AllergyService {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _allergyData: WritableSignal<AllergyData> = signal({
    allergens: [],
    allergicReactions: []
  });
  allergyData: Signal<AllergyData> = this._allergyData.asReadonly();

  // Private subjects
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _error$ = new BehaviorSubject<string | null>(null);
  private readonly _allergyData$ = new BehaviorSubject<AllergyData>({ allergens: [], allergicReactions: [] });

  // Public observables
  public allergyData$: Observable<AllergyData> = this._allergyData$.asObservable();
  public isLoading$: Observable<boolean> = this._loading$.asObservable();
  public error$: Observable<string | null> = this._error$.asObservable();

  get endpoints(): {
    ebplp: string;
    master: string;
    patient: string;
    byId: (id: string) => string;
    list: string;
    search: string;
    status: (id: string) => string;
    allergens: string;
    masterAllergies: string;
    patientAllergies: (patientId: string) => string;
    updateAllergy: (patientId: string, allergyId: string) => string;
    patientAllergyById: (patientId: string, allergyId: string) => string;
  } {
    const ebplp = 'ebplp-api/allergies';
    const master = 'master-api/master';
    const patient = 'patient-api/patients'

    return {
      ebplp,
      master,
      patient,
      byId: (id: string) => `${ebplp}/${id}`,
      list: `${ebplp}/list`,
      search: `${ebplp}/search`,
      status: (id: string) => `${ebplp}/${id}/status`,
      allergens: `${master}/allergens`,
      masterAllergies: `${master}/allergens`,
      patientAllergies: (patientId: string) => `${patient}/${patientId}/allergies`,
      updateAllergy: (patientId: string, allergyId: string) => `${patient}/${patientId}/allergies/${allergyId}`,
      patientAllergyById: (patientId: string, allergyId: string) => `${patient}/${patientId}/allergies/${allergyId}`
    };
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this._loading$.complete();
      this._error$.complete();
      this._allergyData$.complete();
    });

    this.loadAllergyData();

  }

  loadAllergyData(forceRefresh = false): void {
    if (!forceRefresh && this._allergyData$.value.allergens.length > 0) {
      return;
    }

    this._loading$.next(true);
    this._error$.next(null);

    this.api.get<AllergyData>(this.endpoints.masterAllergies)
      .pipe(
        tap(data => {
          const processedData: AllergyData = {
            allergens: data.allergens,
            allergicReactions: data.allergicReactions
          };
          this._allergyData$.next(processedData);
        }),
        catchError(error => {
          this._error$.next(error.message || 'Failed to load allergy data');
          return of(null);
        }),
        finalize(() => this._loading$.next(false))
      )
      .subscribe();
  }

  getCurrentAllergyData(): AllergyData {
    return this._allergyData$.value;
  }

  refreshAllergyData(): void {
    this.loadAllergyData(true);
  }

  createAllergy<T>(data: Allergy, patientId: string): Observable<T> {
    return this.api.post(this.endpoints.patientAllergies(patientId), data);
  }

  updateAllergy<T>(data: Allergy, patientId: string, allergyId: string): Observable<T> {
    return this.api.put(this.endpoints.updateAllergy(patientId, allergyId), data);
  }

  fetchPatientAllergies<T>(patientId: string, params?: HttpParams): Observable<T> {
    return this.api.get(this.endpoints.patientAllergies(patientId), { params });
  }

  fetchPatientAllergyById<T>(patientId: string, allergyId: string): Observable<T> {
    return this.api.get(this.endpoints.patientAllergyById(patientId, allergyId));
  }
}





