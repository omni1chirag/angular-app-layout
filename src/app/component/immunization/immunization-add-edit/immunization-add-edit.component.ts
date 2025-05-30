import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, input, Input, model, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { LabelValue } from '@interface/common-master.interface';
import { TranslateModule } from '@ngx-translate/core';
import { ImmunizationService } from '@service/immunization.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-immunization-add-edit',
  imports: [TranslateModule,
    ReactiveFormsModule,
    DividerModule,
    ButtonModule,
    DrawerModule,
    CommonModule,
    AutoCompleteModule,
    SelectModule,
    DatePickerModule,
    DateMaskDirective,
    InputTextModule,
    MandatoryFieldLabelDirective,
  ],
  templateUrl: './immunization-add-edit.component.html',
  styleUrl: './immunization-add-edit.component.scss'
})
export class ImmunizationAddEditComponent implements OnInit {

  @Input("isVisible")
  set setIsVisible(value: boolean) {
    this.isVisible.set(value);
  }

  @Output("isVisible")
  get getIsVisible(): boolean {
    return this.isVisible();
  }

  isVisible = model<boolean>(false);
  selectedImmunization = input<any>();
  @Output() onImmunizationUpdate = new EventEmitter<any>();

  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();

  immunizationForm: FormGroup;
  immunizationId;
  isCallInitiated = false;
  minDate: Date = new Date();
  maxDate: Date = new Date();

  doseNumberOptions: LabelValue[] = [];
  doseNumberSuggestions: LabelValue[] = [];
  routeOptions: LabelValue[] = [];
  siteOptions: LabelValue[] = [];
  statusOptions: LabelValue[] = [];
  immunizationSuggestion: LabelValue[] = [];
  vaccineSuggestions: LabelValue[] = [];

  get getStatus() {
    return this.immunizationForm.get('status');
  }
  isBrowser: boolean = false;

  constructor(private _fb: FormBuilder,
    private immunizationService: ImmunizationService,
    private masterService: MasterService,
    private utilityService: UtilityService,
    private platformService: PlatformService,) {

    this.isBrowser = platformService.isBrowser();

    effect(() => {
      if (!this.isBrowser) return;

      this.initializeMasterData();

      this.initializeForm(this.selectedImmunization());
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.minDate = new Date(this.selectedImmunization()?.dateOfVaccination || this.minDate);
    this.minDate.setHours(0, 0, 0, 0);
    this.maxDate.setMonth(this.maxDate.getMonth() + 3);
    this.maxDate.setHours(23, 59, 59, 999);

  }

  initializeForm(immunization?: any) {
    this.immunizationForm = this._fb.group({
      immunizationId: new FormControl<string | null>({ value: immunization?.immunizationId, disabled: true }),
      immunizationName: new FormControl<string | null>(immunization?.immunizationName, [Validators.required, Validators.maxLength(100)]),
      appointmentId: new FormControl<string | null>(immunization?.appointmentId ?? this.appointmentId(), [Validators.required]),
      doseNumber: new FormControl<string | null>(immunization?.doseNumber, [Validators.required]),
      dateOfVaccination: new FormControl<Date | null>(immunization?.dateOfVaccination ? new Date(immunization.dateOfVaccination) : null, [Validators.required]),
      administeredBy: new FormControl<string | null>(immunization?.administeredBy, [Validators.required, Validators.maxLength(100)]),
      routeId: new FormControl<string | null>(immunization?.routeId),
      siteId: new FormControl<string | null>(immunization?.siteId),
      status: new FormControl<string | null>((immunization?.status ?? 1), [Validators.required]),
      comments: new FormControl<string | null>(immunization?.comments, [Validators.maxLength(500)]),
    })

    if (immunization?.immunizationId) {
      this.immunizationId = immunization?.immunizationId;
      this.disableFields();
    }
  }

  save() {

    if (this.immunizationForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.immunizationForm);
      return;
    }

    const formValue = this.immunizationForm.getRawValue();
    this.immunizationForm.patchValue({
      dateOfVaccination: formValue.dateOfVaccination
        ? new Date(Date.UTC(
          formValue.dateOfVaccination.getFullYear(),
          formValue.dateOfVaccination.getMonth(),
          formValue.dateOfVaccination.getDate()
        ))
        : null
    });

    const immunizationData = { ...this.immunizationForm.getRawValue() };
    this.isCallInitiated = true;

    const apiCall = this.immunizationId
      ? this.immunizationService.updateImmunization(this.patientId(), this.immunizationId, immunizationData)
      : this.immunizationService.addImmunization(this.patientId(), immunizationData);

    apiCall.subscribe({
      next: (response: any) => {
        this.isCallInitiated = false;
        this.isVisible.set(false);
        this.onImmunizationUpdate.emit(response?.data);
      },
      error: (error) => {
        this.isCallInitiated = false;
      },
      complete: () => {
        this.isCallInitiated = false;
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

  onSelectImmunization(event: any) {
    this.immunizationForm.get('immunizationName')?.setValue(event?.value?.value);
  }

  disableFields() {
    if (this.getStatus?.value == 2) {  //For Administered
      this.immunizationForm.disable();
      const commentsControl = this.immunizationForm.get('comments') as FormControl;
      commentsControl.enable();
      commentsControl.updateValueAndValidity();
      this.immunizationForm.updateValueAndValidity();
    }
  }

  searchDoseNumber(searchParam: string): void {
    const filtered = this.doseNumberOptions.filter(dose =>
      dose.label.toLowerCase().includes(searchParam.trim().toLowerCase())
    );

    const hasExactMatch = filtered.some(
      dose => dose.label.toLowerCase() === searchParam.trim().toLowerCase()
    );

    this.doseNumberSuggestions = hasExactMatch
      ? filtered
      : [{ label: searchParam, value: searchParam }, ...filtered];
  }

  onSelectDoseNumber(event: any) {
    this.immunizationForm.get('doseNumber')?.setValue(event?.value?.value);
  }
}
