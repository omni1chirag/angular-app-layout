import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AllergyService } from '@service/allergy.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DividerModule } from 'primeng/divider';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { Allergen, AllergicReaction } from '@interface/allergy.interface';
import { TableModule } from 'primeng/table';
import { AllergyAddEditComponent } from "../allergy-add-edit/allergy-add-edit.component";
import { DrawerModule } from 'primeng/drawer';
import { Subscription } from 'rxjs';
import { LabelValue } from '@interface/common-master.interface';
import { Allergy } from '@model/allergy.model';
import { TagModule } from 'primeng/tag';
import { PatientService } from '@service/patient.service';
import { TranslateModule } from '@ngx-translate/core';
import { HttpParams } from '@angular/common/http';
import { LazyLoadEvent } from 'primeng/api';


@Component({
  selector: 'app-allergy-list',
  imports: [
    DividerModule,
    AutoCompleteModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    CommonModule,
    TableModule,
    AllergyAddEditComponent,
    DrawerModule,
    TagModule,
    TranslateModule
  ],
  templateUrl: './allergy-list.component.html',
  styleUrl: './allergy-list.component.scss'
})
export class AllergyListComponent implements OnInit {
  masterAllergens: Allergen[] = [];
  allergens: Allergen[] = [];
  patientAllergies: Allergy[] = [];
  isBrowser: boolean = false;
  allergenSuggestions: Allergen[] = [];
  selectedCategory: string;
  selectedAllergy = signal<Allergy | null>(null);
  _selectedAllergy = new Allergy();
  categories: LabelValue[];
  isAllergyOpen: boolean = false;
  rowsPerPage = 10;
  totalRecords = 0;
  showLoader = false;
  first = 0;
  defaultSortField: string = 'allergyStatus';
  defaultSortOrder: number = 1;
  private subscriptions = new Subscription();
  isLoading = false;
  allergicReactions: AllergicReaction[] = [];
  readonly patientId = input.required<string>();
  readonly appointmentId = input.required<string>();
  constructor(
    private allergyService: AllergyService,
    private platformService: PlatformService,
    private masterService: MasterService,
    private patientService: PatientService
  ) {
    this.isBrowser = this.platformService.isBrowser();
    if (this.isBrowser) {
      this.allergyService.loadAllergyData(true);
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeMasterData();
      this.initializeAllergyData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeAllergyData() {

    this.subscriptions.add(
      this.allergyService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.add(
      this.allergyService.error$.subscribe(error => {
        console.error('allergy-list error : ', error)
      })
    );

    this.subscriptions.add(
      this.allergyService.allergyData$.subscribe(data => {
        this.masterAllergens = data.allergens;
        this.allergens = this.masterAllergens;
      })
    );
  }

  initializeMasterData() {
    const params = ['ALLERGY_CATEGORIES']

    this.masterService.getCommonMasterData(params).subscribe({
      next: (resp: any) => {
        (resp.data as Array<any>).forEach((res: any) => {
          switch (res.name) {
            case 'ALLERGY_CATEGORIES':
              this.categories = res.value
              break;
            default:
              console.error('master data name not found', res.name);
              break;
          }
        })
      },
      error: (error) => {
        console.error('Error while fetching master data:', error);
      }
    });

  }

  initializePatientAllergies(params?: HttpParams) {
    this.allergyService.fetchPatientAllergies(this.patientId(), params).subscribe({
      next: (response) => {
        this.patientAllergies = response.data.content;
        this.totalRecords = response.data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        console.error('allergy-list error : ', error);
        this.showLoader = false;
      }
    });
  }

  allergenToAllergy(allergen: Allergen) {
    this._selectedAllergy.allergenName = allergen.allergenName;
    this._selectedAllergy.allergenType = allergen.allergenType;
    this._selectedAllergy.allergyStatus = 'ACTIVE'
    this.openAllergy();
  }

  editAllergy(allergy: Allergy) {
    this._selectedAllergy = allergy;
    this.openAllergy();
  }

  openAllergy() {
    this.selectedAllergy.set(this._selectedAllergy);
    this.isAllergyOpen = true;
  }

  onChangeAllergy(event: SelectButtonChangeEvent) {
    if (this.selectedCategory == event.value) {
      this.selectedCategory = null
      this.allergens = this.masterAllergens;
      return;
    }
    this.selectedCategory = event.value;
    const value = event.value;

    if (value) {
      const selectedAllergy = this.categories.find((item) => {
        return item.value === value;
      });

      this.allergens = this.masterAllergens.filter((item) => {
        return item.allergenType.toLowerCase().includes(selectedAllergy.label.toLowerCase());
      });
    } else {
      this.allergens = this.masterAllergens;
    }
  }

  getStatusTagColor(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (status) {
      case 'RESOLVED':
        return 'success';
      case 'INACTIVE':
        return 'info';
      case 'ONHOLD':
        return 'secondary';
      case 'ACTIVE':
        return 'warn';
      case 'PENDING':
        return 'danger';
      default:
        return null;
    }
  }

  getSeverityTagColor(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (status) {
      case 'MILD':
        return 'success';
      case 'MODERATE':
        return 'warn';
      case 'SEVERE':
        return 'danger';
      case 'UNKNOWN':
        return 'secondary';
      default:
        return null;
    }
  }

  getStatus(status) {
    const statusObj = this.patientAllergies.find((item) => item.allergyStatus == status);
    switch (statusObj?.allergyStatus) {
      case 'RESOLVED':
        return 'Resolved';
      case 'INACTIVE':
        return 'Inactive';
      case 'ACTIVE':
        return 'Active';
      default:
        return '';
    }
  }

  getSeverity(severity) {
    const severityObj = this.patientAllergies.find((item) => item.severity == severity);

    switch (severityObj.severity) {
      case 'MILD':
        return 'Mild';
      case 'MODERATE':
        return 'Moderate';
      case 'SEVERE':
        return 'Severe';
      case 'UNKNOWN':
        return 'Unknown';
      default:
        return '';
    }
  }

  searchAllergens(query: string) {
    const filtered = this.masterAllergens.filter(allergen =>
      allergen.allergenName.toLowerCase().includes(query.toLowerCase())
    );

    const customEntry = {
      allergenName: query,
      allergenType: 'Other',
      allergenId: null
    };

    const exactMatch = filtered.some(allergen => allergen.allergenName.toLowerCase() === query.toLowerCase());

    this.allergenSuggestions = exactMatch ? filtered : [...filtered, customEntry];
  }

  handleAllergyVisibility(value: boolean): void {
    this.isAllergyOpen = value;
    if (!value) {
      this._selectedAllergy = new Allergy();

      const event: LazyLoadEvent = {
        first: this.first,
        rows: this.rowsPerPage,
        sortField: this.defaultSortField,
        sortOrder: this.defaultSortOrder

      };
      this.loadPatientAllergies(event);
    }
  }

  loadPatientAllergies($event) {
    if (!this.isBrowser) { return }
    this.showLoader = true;
    let params = new HttpParams();

    params = params.append('sortField', $event.sortField);
    params = params.append('sortOrder', $event.sortOrder);

    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows)

    if (this.appointmentId()) {
      params = params.append('appointmentId', this.appointmentId());
    }

    this.initializePatientAllergies(params);
  }
}
