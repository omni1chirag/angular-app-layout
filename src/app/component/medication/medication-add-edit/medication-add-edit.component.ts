import { Component, effect, EventEmitter, input, Input, model, OnInit, Output, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { ActivatedRoute } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { UtilityService } from '@service/utility.service';
import { MasterService } from '@service/master.service';
import { MedicationService } from '@service/medication.service';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { LabelValue } from '@interface/common-master.interface';
import { PlatformService } from '@service/platform.service';

@Component({
  selector: 'app-medication-add-edit',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    MandatoryFieldLabelDirective,
    InputTextModule,
    SelectModule,
    InputMaskModule,
    InputNumberModule,
    ButtonModule,
    CommonModule,
    DatePickerModule,
    DividerModule,
    DrawerModule,
    FloatLabelModule,
    InputGroupModule,
    SelectButtonModule,
    DateMaskDirective,
  ],
  templateUrl: './medication-add-edit.component.html',
  styleUrl: './medication-add-edit.component.scss'
})
export class MedicationAddEditComponent implements OnInit {

  @Input("isVisible")
  set setIsVisible(value: boolean) {
    this.isVisible.set(value);
  }

  @Output("isVisible")
  get getIsVisible(): boolean {
    return this.isVisible();
  }
  isVisible = model<boolean>(false);
  @Output() onMedicationUpdate = new EventEmitter<any>();

  @Input() selectedMedication!: Signal<any>;

  medicationForm: FormGroup;
  medicationSuggestion: LabelValue[] = [];
  routeOptions: LabelValue[] = [];
  timingOptions: LabelValue[] = [];
  durationOptions: LabelValue[] = Array.from({ length: 100 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1
  }));
  durationUnitOptions: LabelValue[] = [];

  get selectedTiming() {
    return this.medicationForm.get('timing');
  }

  quantityUnitOptions: LabelValue[] = [];
  isCallInitiated = false;
  medicationId;
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear(), 11, 31);

  statusOptions: LabelValue[] = [];

  get getStatus() {
    return this.medicationForm.get('status');
  }

  isShowReason: boolean = false;
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  isBrowser: boolean = false;

  constructor(private _fb: FormBuilder,
    private utilityService: UtilityService,
    private masterService: MasterService,
    private medicationService: MedicationService,
    private platformService: PlatformService) {

    this.isBrowser = platformService.isBrowser();

    effect(() => {
      if (!this.isBrowser) return;

      this.initializeMasterData();
      this.initializeForm(this.selectedMedication());
      this.setMinDate(this.selectedMedication()?.startDate);
    });
  }

  ngOnInit(): void { }

  initializeForm(medication?: any) {

    this.medicationForm = this._fb.group({
      medicationId: new FormControl<string | null>({ value: medication?.medicationId, disabled: true }),
      medicationName: new FormControl<string | null>(medication?.medicationName, [Validators.required]),
      appointmentId: new FormControl<string | null>(medication?.appointmentId ?? this.appointmentId(), [Validators.required]),
      routeId: new FormControl<string | null>(medication?.routeId, [Validators.required]),
      morningFrequency: new FormControl<string | null>(medication?.morningFrequency, [Validators.required]),
      eveningFrequency: new FormControl<string | null>(medication?.eveningFrequency, [Validators.required]),
      nightFrequency: new FormControl<string | null>(medication?.nightFrequency, [Validators.required]),
      timing: new FormControl<string | null>(medication?.timing, [Validators.required]),
      duration: new FormControl<string | null>(medication?.duration, [Validators.required]),
      durationUnit: new FormControl<string | null>(medication?.durationUnit, [Validators.required]),
      quantity: new FormControl<string | null>(medication?.quantity, [Validators.required]),
      quantityUnit: new FormControl<string | null>(medication?.quantityUnit, [Validators.required]),
      startDate: new FormControl<Date | null>(medication?.startDate ? new Date(medication.startDate) : null, [Validators.required]),
      instructions: new FormControl<string | null>(medication?.instructions, [Validators.maxLength(1000)]),
      status: new FormControl<string | null>((medication?.status ?? 1), [Validators.required]),
      prescribedBy: new FormControl<string | null>(medication?.prescribedBy, [Validators.required]),
      reason: new FormControl<string | null>(medication?.reason),
    });
    if (medication?.status == 3) {  //For Discontinued
      this.isShowReason = true;
      this.updateStatus();
    }
    this.medicationId = medication?.medicationId;
    if (medication?.medicationId) {
      this.medicationForm.get('medicationName')?.setValue({ label: medication?.medicationName, value: medication?.medicationName });
    }

  }

  updateStatus(event?: any) {

    const reasonControl = this.medicationForm.get('reason') as FormControl;
    if (this.getStatus?.value == 3) {  //For Discontinued
      if (!reasonControl.hasValidator(Validators.required)) {
        reasonControl?.setValidators(Validators.required);
      }
      this.isShowReason = true;
    } else {
      if (reasonControl.hasValidator(Validators.required)) {
        reasonControl?.removeValidators(Validators.required);
        this.medicationForm.updateValueAndValidity();
      }
      this.isShowReason = false;
    }
  }

  onSelectMedication(event: any) {
    this.medicationForm.get('medicationName')?.setValue(event?.value?.label);
  }

  save() {
    if (this.medicationForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.medicationForm);
      return;
    }

    const formValue = this.medicationForm.value;
    this.medicationForm.patchValue({
      medicationName: formValue.medicationName?.value ? formValue.medicationName?.value : formValue.medicationName,
      startDate: formValue.startDate
        ? new Date(Date.UTC(
          formValue.startDate.getFullYear(),
          formValue.startDate.getMonth(),
          formValue.startDate.getDate()
        ))
        : null
    });

    const medicationData = { ...this.medicationForm.value };
    this.isCallInitiated = true;

    const apiCall = this.medicationId
      ? this.medicationService.updateMedication(this.patientId(), this.medicationId, medicationData)
      : this.medicationService.saveMedication(this.patientId(), medicationData);

    apiCall.subscribe({
      next: (resp: any) => {
        this.isCallInitiated = false;
        this.isVisible.set(false);
        this.onMedicationUpdate.emit(resp.data);
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
    const params = ['TIMING', 'DURATION_UNIT', 'QUANTITY_UNIT', 'MEDICATION_STATUS', 'ROUTES_OF_ADMINISTRATION'];

    this.masterService.getCommonMasterData(params).subscribe({
      next: (resp: any) => {
        (resp.data as Array<any>).forEach((res: any) => {
          switch (res.name) {
            case 'TIMING':
              this.timingOptions = res.value
              break;
            case 'DURATION_UNIT':
              this.durationUnitOptions = res.value
              break;
            case 'QUANTITY_UNIT':
              this.quantityUnitOptions = res.value
              break;
            case 'MEDICATION_STATUS':
              this.statusOptions = res.value
              break;
            case 'ROUTES_OF_ADMINISTRATION':
              this.routeOptions = res.value
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

  searchMedicines(searchParam: string): void {
    this.medicationService.searchMedicines(searchParam.trim()).subscribe({
      next: (response: any) => {
        if (response?.data?.length > 0) {
          const hasExactMatch = response.data.some(
            (item: any) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.medicationSuggestion = hasExactMatch
            ? response.data
            : [...response.data, { label: searchParam, value: searchParam }];
        } else {
          this.medicationSuggestion = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching medication suggestions:', error);
      }
    });
  }

  setMinDate(startDate: Date) {
    if (startDate) {
      this.minDate = new Date(startDate);
    } else {
      this.minDate = new Date();
    }
    this.minDate.setHours(0, 0, 0, 0);
  }

}
