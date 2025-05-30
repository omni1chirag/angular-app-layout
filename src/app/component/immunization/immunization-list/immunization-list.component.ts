import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LabelValue } from '@interface/common-master.interface';
import { TranslateModule } from '@ngx-translate/core';
import { ImmunizationService } from '@service/immunization.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { ImmunizationAddEditComponent } from '../immunization-add-edit/immunization-add-edit.component';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-immunization-list',
  imports: [
    TranslateModule,
    DividerModule,
    TableModule,
    ButtonModule,
    AutoCompleteModule,
    CommonModule,
    TagModule,
    ImmunizationAddEditComponent
  ],
  templateUrl: './immunization-list.component.html',
  styleUrl: './immunization-list.component.scss'
})
export class ImmunizationListComponent implements OnInit {
  visible: boolean = false;
  selectedImmunization: any = signal<any>(null);
  immunizationList: any[] = [];
  vaccineSuggestions: LabelValue[] = [];
  frequentlyUsedVaccines: LabelValue[] = [];
  doseNumberOptions: LabelValue[] = [];
  routeOptions: LabelValue[] = [];
  siteOptions: LabelValue[] = [];
  statusOptions: LabelValue[] = [];
  isBrowser: boolean = false;
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  rowsPerPage = 10;

  constructor(private immunizationService: ImmunizationService,
    private masterService: MasterService,
    private platformService: PlatformService,
  ) {
    this.isBrowser = platformService.isBrowser();
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    this.getFrequentlyUsedVaccines();
    this.initializeMasterData();
    this.loadImmunizations();
  }

  loadImmunizations(event?: any) {

    const apiCall = this.appointmentId?.()
      ? this.immunizationService.getImmunizations(this.patientId(), this.appointmentId())
      : this.immunizationService.getImmunizations(this.patientId());

    apiCall.subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.immunizationList = response.data;
        } else {
          this.immunizationList = [];
        }
      },
      error: (err) => {
        this.immunizationList = [];
      }
    });

  }

  initializeMasterData() {

    const params = ['IMMUNIZATION_DOSE', 'IMMUNIZATION_SITE', 'IMMUNIZATION_ROUTES', 'IMMUNIZATION_STATUS'];

    this.masterService.getCommonMasterData(params).subscribe({
      next: (resp: any) => {
        (resp.data as Array<any>).forEach((res: any) => {
          switch (res.name) {
            case 'IMMUNIZATION_DOSE':
              this.doseNumberOptions = res.value
              break;
            case 'IMMUNIZATION_SITE':
              this.siteOptions = res.value
              break;
            case 'IMMUNIZATION_ROUTES':
              this.routeOptions = res.value
              break;
            case 'IMMUNIZATION_STATUS':
              this.statusOptions = res.value
              break;

            default:
              console.log('name not found', res.name);
              break;
          }
        })
      },
      error: (error) => {
        console.error('Error fetching master data:', error);
      }
    });
  }

  searchVaccine(searchParam: string) {

    this.immunizationService.searchVaccine(searchParam).subscribe({
      next: (response: any) => {
        if (response?.data?.length > 0) {
          const hasExactMatch = response.data.some(
            (item: any) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.vaccineSuggestions = hasExactMatch
            ? response.data
            : [...response.data, { label: searchParam, value: searchParam }];
        } else {
          this.vaccineSuggestions = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching vaccine suggestions:', error);
      }
    });

  }

  getFrequentlyUsedVaccines() {
    this.immunizationService.getAllFrequentlyUsedVaccines().subscribe({
      next: (response: any) => {
        this.frequentlyUsedVaccines = response?.data || [];
      },
      error: (error) => {
        console.error('Error fetching frequently used vaccines:', error);
      },
    });
  }

  addImmunization(vaccineObj: any) {
    this.visible = true;
    const immunization = {
      immunizationName: vaccineObj?.value
    };
    this.selectedImmunization.set(immunization);
  }

  editImmunization(immunization: any) {
    this.visible = true;
    this.selectedImmunization.set(immunization);
  }

  getDoseNumber(dose: string): string {
    const doseObj = this.doseNumberOptions.find((item) => item.value === dose);
    return doseObj ? doseObj.label : '';
  }

  getRoute(route: string): string {
    const routeObj = this.routeOptions.find((item) => item.value === route);
    return routeObj ? routeObj.label : '';
  }

  getSite(site: string): string {
    const siteObj = this.siteOptions.find((item) => item.value === site);
    return siteObj ? siteObj.label : '';
  }

  getStatus(status: string): string {
    const statusObj = this.statusOptions.find((item) => item.value === status);
    return statusObj ? statusObj.label : '';
  }

  getTagSeverity(status: number | string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (+status) {
      case 1:
        return 'success';
      case 2:
        return 'secondary';
      case 3:
        return 'danger';
      case 4:
        return 'warn';
      default:
        return null;
    }
  }

}
