import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MultiLangService } from './multi-lang.service';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private apiUrls = {
    getCommonMasterData: 'master-api/master/common',
    getInsurances: 'master-api/master/insurances',
    getDepartmentData: 'master-api/master/department',
    getSepcialityData: 'master-api/master/specialization',
    getSubSepcialityData: 'master-api/master/sub-specialization',
    getVisitReasons: 'master-api/master/visit-reasons',
    getTestName: 'master-api/master/labTestName',
    getTestType: 'master-api/master/labTestType',
    getLabSampleName: 'master-api/master/labSampleName',
    getLabSampleCollecionLocation: 'master-api/master/labSampleCollectionLocation',
    getPatientLabStatus: 'master-api/master/patientLabStatus',
    getDocumentTypes: 'master-api/master/document-types',

  }

  private apiService = inject(ApiService);
  private multiLangService = inject(MultiLangService);

  getCommonMasterData<T>(names: string[]): Observable<T> {
    let params = new HttpParams();
    params = params.append('languageCode', this.multiLangService.languageSignal().toUpperCase());
    names.forEach((name) => {
      params = params.append('name', name);
    })
    return this.apiService.get(this.apiUrls.getCommonMasterData, { params });
  }

  getInsurances(): Observable<any> {
    return this.apiService.get(this.apiUrls.getInsurances);
  }

  getDepartmentData<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getDepartmentData)
  }

  getSpeciality<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getSepcialityData)
  }

  getSubSpeciality<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getSubSepcialityData)
  }

  getRFVMaster<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.getVisitReasons,{params});
  }
  getTestName<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getTestName);
  }

  getTestType<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getTestType);
  }

  getLabSampleName<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getLabSampleName);
  }

  getLabSampleCollecionLocation<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getLabSampleCollecionLocation);
  }

  getPatientLabStatus<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getPatientLabStatus);
  }

  getDocumentTypes<T>(): Observable<T> {
    return this.apiService.get(this.apiUrls.getDocumentTypes);
  }
}
