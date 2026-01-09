import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { MultiLangService } from './multi-lang.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private readonly apiService = inject(ApiService);
  private readonly multiLangService = inject(MultiLangService);

  get endpoints(): {
    base: string;
    master: string;
    common: string;
    statesAndCities: string;
    visitReasons: string;
    address: string;
    otp: string;
    documentType: string;
    patientLabStatus: string;
    testType: string;
    labSampleCollecionLocation: string;
    labSampleName: string;
    insurance: string;
  } {
    const base = '/master-api'
    const master = `${base}/master`;
    const common = `${master}/common`;
    const statesAndCities = `${master}/states-and-cities`;
    const visitReasons = `${master}/visit-reasons`;
    const address = `${master}/address`;
    const otp = `${master}/otp`;
    const documentType = `${master}/document-types`;
    const patientLabStatus = `${master}/patient-lab-status`;
    const testType = `${master}/lab-test-type`;
    const labSampleCollecionLocation = `${master}/lab-sample-collection-location`;
    const labSampleName = `${master}/lab-sample-name`;
    const insurance = `${master}/insurances`;
    return {
      base,
      master,
      common,
      statesAndCities,
      visitReasons,
      address,
      otp,
      documentType,
      patientLabStatus,
      testType,
      labSampleCollecionLocation,
      labSampleName,
      insurance
    }
  }

  getAddress<T>(pincode: string): Observable<T> {
    return this.apiService.get<T>(`${this.endpoints.address}/${pincode}`);
  }

  getCommonMasterData<T>(names: string[]): Observable<T> {
    let params = new HttpParams();
    params = params.append('languageCode', this.multiLangService.languageSignal().toUpperCase());
    names.forEach((name) => {
      params = params.append('name', name);
    })
    return this.apiService.get<T>(this.endpoints.common, { params });
  }

  getStatesAndCities<T>(): Observable<T> {
    return this.apiService.get<T>(this.endpoints.statesAndCities);
  }

  getRFVMaster<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(this.endpoints.visitReasons, { params });
  }

  getDocumentTypes<T>(): Observable<T> {
    return this.apiService.get<T>(this.endpoints.documentType);
  }

  getPatientLabStatus<T>(): Observable<T> {
    return this.apiService.get<T>(this.endpoints.patientLabStatus);
  }

  getTestType<T>(): Observable<T> {
    return this.apiService.get<T>(this.endpoints.testType);
  }

  getLabSampleCollecionLocation<T>(): Observable<T> {
    return this.apiService.get<T>(this.endpoints.labSampleCollecionLocation);
  }

  getLabSampleName<T>(): Observable<T> {
    return this.apiService.get<T>(this.endpoints.labSampleName);
  }

  getInsurances<T>(): Observable<T> {
    return this.apiService.get<T>(this.endpoints.insurance);
  }
}
