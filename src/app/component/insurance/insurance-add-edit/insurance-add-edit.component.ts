import { CommonModule } from '@angular/common';
import { Component, inject, input, model, OnDestroy, OnInit, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { REGEX } from '@constants/regex.constant';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { PatientInsurance } from '@model/insurance.model';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { PatientInsuranceService } from '@service/patient-insurance.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-insurance-add-edit',
  imports: [DrawerModule, ButtonModule, DividerModule, CommonModule, ReactiveFormsModule, SelectModule, TranslateModule, DatePickerModule, FileUploadComponent, SelectButtonModule, InputNumberModule, InputTextModule],
  templateUrl: './insurance-add-edit.component.html',
})
export class InsuranceAddEditComponent implements OnInit, OnDestroy {

  private readonly utilityService = inject(UtilityService);
  private readonly patientInsuranceService = inject(PatientInsuranceService);
  private readonly platformService = inject(PlatformService);
  private readonly masterService = inject(MasterService);
  private readonly _fb = inject(FormBuilder);

  isVisible = model<boolean>(false);
  readonly patientInsuranceId = input<string>(null);
  insuranceForm: FormGroup;
  mode: 'ADD_PATIENT_INSURANCE' | 'EDIT_PATIENT_INSURANCE' = 'ADD_PATIENT_INSURANCE';
  insuranceProviders: LabelValue<number>[] = [];
  documentTypes = ".jpeg,.png,.jpg";
  statuses: LabelValue<number>[] = [];
  isCallInitiated = false;
  patientId = input<string>('');
  insuranceSaved = output<void>();
  today: Date = new Date();
  formSubscription$ = new Subject<void>();
  alphaNumericSpace: RegExp = REGEX.ALPHA_NUMERIC_SPACE;

  get insuranceProvider(): number {
    return this.insuranceForm?.get("insuranceId").value;
  }

  get policyStartDate(): Date {
    return this.insuranceForm?.get("policyStartDate").value ?? new Date();
  }

  ngOnInit(): void {
    this.platformService.onBrowser(() => {
      if (!this.patientId()) {
        console.error('Patient ID is not provided');
        return;
      }
      this.initializeMasterData();
      if (this.patientInsuranceId()) {
        this.mode = 'EDIT_PATIENT_INSURANCE';
        this.initializePatientInsurance(this.patientInsuranceId());
      } else {
        this.initializeForm(null);
      }
    });
  }

  initializeForm(insurance?: PatientInsurance): void {
    this.insuranceForm = this._fb.group({
      patientInsuranceId: new FormControl<string | null>({ value: insurance?.patientInsuranceId, disabled: true }),
      insuranceId: new FormControl<number | null>(insurance?.insuranceId, [Validators.required]),
      insuranceFreeText: new FormControl<string | null>(insurance?.insuranceFreeText, [Validators.maxLength(100), Validators.pattern(this.alphaNumericSpace)]),
      policyNumber: new FormControl<string | null>(insurance?.policyNumber, [Validators.required, Validators.maxLength(30)]),
      policyStartDate: new FormControl<Date | null>(insurance?.policyStartDate ? new Date(insurance?.policyStartDate) : undefined, [Validators.required]),
      policyExpiryDate: new FormControl<Date | null>(insurance?.policyExpiryDate ? new Date(insurance?.policyExpiryDate) : undefined, [Validators.required]),
      status: new FormControl<number | null>(insurance?.status ?? 1, [Validators.required]),
      policyFrontSide: new FormControl<string | null>(undefined),
      policyBackSide: new FormControl<string | null>(undefined),
    })
    const addOrRemoveValidation = (insuranceId) => {
      if (!insuranceId && insuranceId != 0) return;
      const insuranceFreeText = this.insuranceForm.get('insuranceFreeText') as FormControl;
      if (0 == insuranceId) {
        if (!insuranceFreeText.hasValidator(Validators.required)) {
          insuranceFreeText.addValidators(Validators.required);
        }
      } else if (insuranceFreeText.hasValidator(Validators.required)) {
        insuranceFreeText.removeValidators(Validators.required);

      }
    }
    this.insuranceForm.get('insuranceId')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => addOrRemoveValidation(value));
    addOrRemoveValidation(this.insuranceForm.get('insuranceId').value);
  }

  initializePatientInsurance(patientInsurance: string): void {
    if (!this.patientId()) {
      console.error('Patient ID is not provided');
      return;
    }
    this.patientInsuranceService.getPatientInsurance(this.patientId(), patientInsurance).subscribe({
      next: (res) => {
        this.initializeForm(res as PatientInsurance);
      },
      error: (err) => {
        console.error('Error fetching patient insurance details:', err);
      }
    });
  }

  initializeMasterData(): void {
    this.masterService.getInsurances<LabelValue<number>[]>().subscribe((data) => {
      this.insuranceProviders = data;
      this.insuranceProviders.push({ value: 0, label: 'Others' });
    })
    const params = ['STATUS']
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        if (res.name == 'STATUS') {
          this.statuses = res.value as LabelValue<number>[];
        } else {
          console.warn('name not found', res.name);
        }
      })
    })
  }


  setInsuranceToOther(): void {
    this.insuranceForm.get('insuranceId').setValue(0);
  }

  save(): void {
    if (this.insuranceForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.insuranceForm);
      return;
    }

    const patientInsuranceId = this.insuranceForm.get('patientInsuranceId').value;
    const patientInsurance = this.insuranceForm.value;
    this.isCallInitiated = true;
    const apiCall = patientInsuranceId
      ? this.patientInsuranceService.updatePatientInsurance<string>(this.patientId(), patientInsuranceId, patientInsurance)
      : this.patientInsuranceService.savePatientInsurance<string>(this.patientId(), patientInsurance);

    apiCall.subscribe({
      next: () => {
        this.isCallInitiated = false;
        this.insuranceSaved.emit();
      },
      error: () => {
        this.isCallInitiated = false;
      },
      complete: () => { this.isCallInitiated = false }
    })
  }

  ngOnDestroy(): void {
    this.formSubscription$.next();
    this.formSubscription$.complete();
  }
}
