import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, input, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AllergyService } from '@service/allergy.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DividerModule } from 'primeng/divider';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { Allergen, AllergicReaction, Allergy } from '@interface/allergy.interface';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { AllergyAddEditComponent } from "../allergy-add-edit/allergy-add-edit.component";
import { DrawerModule } from 'primeng/drawer';
import { Subscription } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';
import { HttpParams } from '@angular/common/http';
import { LazyLoadEvent } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { PaginationResponse } from '@interface/api-response.interface';
import { LocalStorageService } from '@service/local-storage.service';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';


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
    TranslateModule,
    TooltipModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './allergy-list.component.html'
})
export class AllergyListComponent implements OnInit, OnDestroy {

  private readonly allergyService = inject(AllergyService);
  private readonly platformService = inject(PlatformService);
  private readonly masterService = inject(MasterService);
  private readonly localStorageService = inject(LocalStorageService);

  masterAllergens: Allergen[] = [];
  allergens: Allergen[] = [];
  patientAllergies: Allergy[] = [];
  isBrowser = false;
  allergenSuggestions: Allergen[] = [];
  selectedCategory: string;
  selectedAllergy = signal<Allergy | null>(null);
  _selectedAllergy = new Allergy();
  categories: LabelValue<string>[];
  isAllergyOpen = false;
  rowsPerPage = 10;
  totalRecords = 0;
  showLoader = true;
  first = 0;
  defaultSortField = 'allergyStatus';
  defaultSortOrder = 1;
  private readonly subscriptions = new Subscription();
  isLoading = false;
  allergicReactions: AllergicReaction[] = [];
  readonly patientId = this.localStorageService.getPatientId();
  readonly appointmentId = input.required<string>();
  readonly signOff = input.required<number>();
  readonly isModifiable = input.required<boolean>();
 

  constructor() {
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

  initializeAllergyData(): void {

    this.subscriptions.add(
      this.allergyService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.add(
      this.allergyService.error$.subscribe(error => {
        if (error) {
          console.error('allergy-list error : ', error)
        }
      })
    );

    this.subscriptions.add(
      this.allergyService.allergyData$.subscribe(data => {
        this.masterAllergens = data.allergens;
        this.allergens = this.masterAllergens;
      })
    );
  }

  initializeMasterData(): void {
    const params = ['ALLERGY_CATEGORIES']

    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        if (res.name === 'ALLERGY_CATEGORIES') {
          this.categories = res.value as LabelValue<string>[];
        } else {
          console.error('master data name not found', res.name);
        }
      });
    });

  }

  initializePatientAllergies(params?: HttpParams): void {
    this.showLoader = true;

    this.allergyService.fetchPatientAllergies(this.patientId, params).subscribe({
      next: (data: PaginationResponse<Allergy>) => {
        this.patientAllergies = data.content;
        this.totalRecords = data.totalElements;
        this.showLoader = false;
      },
      error: (error) => {
        console.error('allergy-list error : ', error);
        this.showLoader = false;
      }
    });
  }

  allergenToAllergy(allergen: Allergen): void {
    this._selectedAllergy.allergenName = allergen.allergenName;
    this._selectedAllergy.allergenType = allergen.allergenType;
    this._selectedAllergy.allergyStatus = 'ACTIVE'
    this.openAllergy();
  }

  editAllergy(allergy: Allergy): void {
    this._selectedAllergy = allergy;
    this.openAllergy();
  }

  openAllergy(): void {
    this.selectedAllergy.set(this._selectedAllergy);
    this.isAllergyOpen = true;
  }

  onChangeAllergy(event: SelectButtonChangeEvent): void {
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
        return 'info';
      case 'INACTIVE':
        return 'secondary';
      case 'ACTIVE':
        return 'success';
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

  getStatus(status: string): string {
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

  getSeverity(severity: string): string {
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

  searchAllergens(query: string): void {
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

  loadPatientAllergies($event: TableLazyLoadEvent): void {
    if (!this.isBrowser) { return }
    let params = new HttpParams();

    const sortField = Array.isArray($event.sortField) ? $event.sortField[0] : $event.sortField;
    if (sortField) {
      params = params.append('sortField', sortField);
      params = params.append('sortOrder', ($event.sortOrder ?? 1).toString());
    }

    params = params.append('source', 'PATIENT_APP');
    params = params.append('page', Math.floor($event.first / $event.rows));
    params = params.append('size', $event.rows)

    if (this.appointmentId()) {
      params = params.append('appointmentId', this.appointmentId());
    }

    this.initializePatientAllergies(params);
  }
}
