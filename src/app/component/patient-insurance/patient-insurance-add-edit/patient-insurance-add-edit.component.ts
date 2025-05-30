import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, model, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
import { PatientInsuranceService } from '@service/patient-insurance.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { UUID } from 'crypto';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-patient-insurance-add-edit',
  imports: [
    ToolbarModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextModule,
    TranslateModule,
    MandatoryFieldLabelDirective,
    DatePickerModule,
    DateMaskDirective,
    DividerModule,
    CommonModule,
    FormsModule,
    DrawerModule,
    SelectModule,
    FileUploadComponent,
    ButtonModule,
    SelectButtonModule
  ],
  templateUrl: './patient-insurance-add-edit.component.html',
  styleUrl: './patient-insurance-add-edit.component.scss'
})
export class PatientInsuranceAddEditComponent implements OnInit, OnDestroy {

  readonly patientInsuranceId = signal<string>(null);
  isVisible = model<boolean>(false);
  @Output() onInsuranceUpdate = new EventEmitter<any>();

  @Input("patientInsuranceId")
  set setPatientInsuranceId(patientInsuranceId: string) {
    this.patientInsuranceId.set(patientInsuranceId);
  }

  @Input("isVisible")
  set setIsVisible(value: boolean) {
    this.isVisible.set(value);
  }

  @Output("isVisible")
  get getIsVisible(): boolean {
    return this.isVisible();
  }

  get insuranceProvider(): number {
    return this.insuranceForm?.get("insuranceId").value;
  }

  get policyStartDate(): Date {
    return this.insuranceForm?.get("policyStartDate").value ?? new Date();
  }

  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/);
  isBrowser: boolean = false;
  mode: 'ADD_PATIENT_INSURANCE' | 'EDIT_PATIENT_INSURANCE' = 'ADD_PATIENT_INSURANCE';
  insuranceForm: FormGroup;
  insuranceProviders: any[] = [];
  documentTypes = ".jpeg,.png,.jpg";
  isCallInitiated = false;
  patientId: string = null;
  statuses: any[] = [];
  formSubscription$ = new Subject<void>();

  constructor(private platformService: PlatformService,
    private _fb: FormBuilder,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private masterService: MasterService,
    private activatedRoute: ActivatedRoute,
    private patientInsuranceService: PatientInsuranceService,
  ) {
    this.isBrowser = platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
    const { params } = this.activatedRoute.snapshot;
    this.patientId = params['id'];
    if(!this.patientId){
      const { params } = this.activatedRoute.parent?.snapshot;
      this.patientId = params['id'];
    }
    if (this.patientInsuranceId()) {
      this.getInsurance(this.patientInsuranceId());
    } else {
      this.initializeForm();
    }
  }

  ngOnDestroy(): void {
    this.formSubscription$.next();
    this.formSubscription$.complete();
  }

  initializeForm(insurance?) {
    this.insuranceForm = this._fb.group({
      patientInsuranceId: new FormControl<UUID | null>({ value: insurance?.patientInsuranceId, disabled: true }),
      insuranceId: new FormControl<string | null>(insurance?.insuranceId, [Validators.required]),
      insuranceFreeText: new FormControl<string | null>(insurance?.insuranceFreeText, [Validators.maxLength(100), Validators.pattern(this.alphaNumericSpace)]),
      policyNumber: new FormControl<string | null>(insurance?.policyNumber, [Validators.required, Validators.maxLength(30)]),
      policyStartDate: new FormControl<Date | null>(insurance?.policyStartDate ? new Date(insurance?.policyStartDate) : undefined, [Validators.required]),
      policyExpiryDate: new FormControl<Date | null>(insurance?.policyExpiryDate ? new Date(insurance?.policyExpiryDate) : undefined, [Validators.required]),
      status: new FormControl<String | null>((insurance?.status ?? 1) + '', [Validators.required]),
      policyFrontSide: new FormControl<String | null>(undefined),
      policyBackSide: new FormControl<String | null>(undefined),
    })
    const addOrRemoveValidation = (insuranceId) => {
      if (!insuranceId && insuranceId != 0) return;
      const insuranceFreeText = this.insuranceForm.get('insuranceFreeText') as FormControl;
      if (0 == insuranceId) {
        if (!insuranceFreeText.hasValidator(Validators.required)) {
          insuranceFreeText.addValidators(Validators.required);
        }
      } else {
        if (insuranceFreeText.hasValidator(Validators.required)) {
          insuranceFreeText.removeValidators(Validators.required);
        }
      }
    }
    this.insuranceForm.get('insuranceId')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => addOrRemoveValidation(value));
    addOrRemoveValidation(this.insuranceForm.get('insuranceId').value);
  }

  initializeMasterData() {
    this.masterService.getInsurances().subscribe((resp: any) => {
      this.insuranceProviders = resp.data;
      this.insuranceProviders.push({ value: 0, label: 'Others' });
    })
    const params = ['STATUS']
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'STATUS':
            this.statuses = res.value
            break;
          default:
            console.log('name not found', res.name);
            break;
        }

      })
    })
  }

  setInsuranceToOther() {
    this.insuranceForm.get('insuranceId').setValue(0);
  }

  getInsurance(insuranceId) {
    this.patientInsuranceService.getPatientInsurance(this.patientId, insuranceId).subscribe((resp: any) => {
      this.mode = 'EDIT_PATIENT_INSURANCE';
      this.initializeForm(resp.data);
    }, (error) => {
      this.notificationService.showError(error.error.message);
    });

  }

  save() {
    if (this.insuranceForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.insuranceForm);
      return;
    }

    const patientInsuranceId = this.insuranceForm.get('patientInsuranceId').value;
    const patientInsurance = this.insuranceForm.value;
    this.isCallInitiated = true;
    const apiCall = patientInsuranceId
      ? this.patientInsuranceService.updatePatientInsurance(this.patientId, patientInsuranceId, patientInsurance)
      : this.patientInsuranceService.savePatientInsurance(this.patientId, patientInsurance);

    apiCall.subscribe({
      next: (resp: any) => {
        this.isCallInitiated = false;
        this.onInsuranceUpdate.emit(resp);
      },
      error: (error) => {
        this.isCallInitiated = false;
      },
      complete: () => { this.isCallInitiated = false }
    })
  }
}


