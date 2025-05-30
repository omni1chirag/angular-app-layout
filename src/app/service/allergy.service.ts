import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { BehaviorSubject, catchError, finalize, Observable, of, Subject, tap } from 'rxjs';
import { AllergyData } from '@interface/allergy.interface';
import { Allergy } from '@model/allergy.model';

@Injectable({
  providedIn: 'root',

})
@Injectable()
export class AllergyService {
  private api = inject(ApiService);

  private _allergyData: WritableSignal<AllergyData> = signal({
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

  get endpoints() {
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
      updateAllergy:  (patientId: string, allergyId: string) => `${patient}/${patientId}/allergies/${allergyId}`,
      patientAllergyById: (patientId: string, allergyId: string) => `${patient}/${patientId}/allergies/${allergyId}`
    };
  }

  constructor(destroyRef: DestroyRef) {
    destroyRef.onDestroy(() => {
      console.log('Allergy service Destroyed via DestroyRef!!!!!!!');
      this._loading$.complete();
      this._error$.complete();
      this._allergyData$.complete();
    });

    this.loadAllergyData();

  }

  loadAllergyData(forceRefresh: boolean = false): void {
    if (!forceRefresh && this._allergyData$.value.allergens.length > 0) {
      return;
    }

    this._loading$.next(true);
    this._error$.next(null);

    this.api.get<{ data: AllergyData }>(this.endpoints.masterAllergies)
      .pipe(
        tap(response => {
          const processedData: AllergyData = {
            allergens: response.data.allergens,
            allergicReactions: response.data.allergicReactions
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

  createAllergy(data: Allergy, patientId: string): Observable<any> {
    return this.api.post(this.endpoints.patientAllergies(patientId), data);
  }

  updateAllergy(data:Allergy, patientId: string, allergyId: string): Observable<any> {
    return this.api.put(this.endpoints.updateAllergy(patientId, allergyId), data);
  }

  fetchPatientAllergies(patientId: string, params?): Observable<any> {
    return this.api.get(this.endpoints.patientAllergies(patientId), {params});
  }

  fetchPatientAllergyById(patientId: string, allergyId: string): Observable<any> {
    return this.api.get(this.endpoints.patientAllergyById(patientId, allergyId));
  }
}





