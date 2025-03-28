import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Practice {
  id: number;
  name: string;
  type: string;
  organization: string;
  state: string;
  status: string;
  statusBoolean: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PracticeService {
  private jsonUrl = '/data/practices.json';
  constructor(private http: HttpClient) { }

  getPractices(): Observable<Practice[]> {
    return this.http.get<Practice[]>(this.jsonUrl).pipe(
      map(practices => practices)
    );
  }

  getPracticesMedium(): Observable<Practice[]> {
    return this.http.get<Practice[]>(this.jsonUrl).pipe(
      map(practices => practices.slice(0, 30))
    );
  }

  getPracticeTypeList() {
    return [
      { "label": "Cancer Institute", "value": "cancerInstitute" },
      { "label": "Diagnostic Center", "value": "diagnosticCenter" },
      { "label": "Homeopathy Clinic", "value": "homeopathyClinic" },
      { "label": "Dental Clinic", "value": "dentalClinic" },
      { "label": "Clinic", "value": "clinic" },
      { "label": "Polyclinic", "value": "polyclinic" },
      { "label": "Physiotherapy Center", "value": "physiotherapyCenter" },
      { "label": "Ayurvedic Clinic", "value": "ayurvedicClinic" },
      { "label": "Wellness Center", "value": "wellnessCenter" },
      { "label": "Hospital", "value": "hospital" },
      { "label": "Cardiology Clinic", "value": "cardiologyClinic" },
      { "label": "Pediatric Hospital", "value": "pediatricHospital" },
      { "label": "Neurology Clinic", "value": "neurologyClinic" },
      { "label": "Eye Hospital", "value": "eyeHospital" }
    ]
  }

  getPracticeTypes() {
    return Promise.resolve(this.getPracticeTypeList());
}
}
