import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, input, Input, model, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { LabelValue } from '@interface/common-master.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DiagnosisService } from '@service/diagnosis.service';
import { MasterService } from '@service/master.service';
import { NotificationService } from '@service/notification.service';
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
  selector: 'app-diagnosis-add-edit',
  imports: [
    TranslateModule,
    DrawerModule,
    ReactiveFormsModule,
    DividerModule,
    ButtonModule,
    CommonModule,
    AutoCompleteModule,
    MandatoryFieldLabelDirective,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    DateMaskDirective,
  ],
  templateUrl: './diagnosis-add-edit.component.html',
  styleUrl: './diagnosis-add-edit.component.scss'
})
export class DiagnosisAddEditComponent implements OnInit {

  @Input("isVisible")
  set setIsVisible(value: boolean) {
    this.isVisible.set(value);
  }

  @Output("isVisible")
  get getIsVisible(): boolean {
    return this.isVisible();
  }
  isVisible = model<boolean>(false);
  @Output() onDiagnosisUpdate = new EventEmitter<any>();

  selectedDiagnosis = input<any>();

  diagnosisForm: FormGroup;
  selectedDiagnosisId;
  isCallInitiated = false;
  diagnosisSuggestion: LabelValue[] = [];
  statusOptions: LabelValue[] = [];
  today: Date = new Date();

  get getStatus() {
    return this.diagnosisForm.get('status');
  }
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  isBrowser: boolean = false;

  constructor(private _fb: FormBuilder,
    private diagnosisService: DiagnosisService,
    private masterService: MasterService,
    private utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private platformService: PlatformService,
  ) {
    this.isBrowser = platformService.isBrowser();

    effect(() => {
      if (!this.isBrowser) return;

      this.initializeMasterData();
      this.initializeForm(this.selectedDiagnosis());
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.today.setHours(23, 59, 59, 999);
  }

  initializeForm(diagnosis?: any) {

    this.diagnosisForm = this._fb.group({
      diagnosisId: new FormControl<string | null>({ value: diagnosis?.diagnosisId, disabled: true }),
      diagnosisName: new FormControl<string | null>(diagnosis?.diagnosisName, [Validators.required, Validators.maxLength(100)]),
      appointmentId: new FormControl<string | null>(diagnosis?.appointmentId ?? this.appointmentId(), [Validators.required]),
      onsetDate: new FormControl<Date | null>(diagnosis?.onsetDate ? new Date(diagnosis.onsetDate) : null, [Validators.required]),
      reportedDate: new FormControl<Date | null>(diagnosis?.reportedDate ? new Date(diagnosis.reportedDate) : null, [Validators.required]),
      endDate: new FormControl<Date | null>(diagnosis?.endDate ? new Date(diagnosis.endDate) : null),
      status: new FormControl<string | null>((diagnosis?.status ?? 1), [Validators.required]),
      notes: new FormControl<string | null>(diagnosis?.notes, [Validators.maxLength(1000)]),
    }, {
      validators: [
        this.onsetBeforeEndValidator(),
        this.reportedAfterOnsetValidator()
      ]
    });

    this.selectedDiagnosisId = diagnosis?.diagnosisId;
    this.updateStatus();

    if (diagnosis?.diagnosisId) {
      const diagnosisNameCtrl = this.diagnosisForm.get('diagnosisName');
      diagnosisNameCtrl.setValue({ label: diagnosis?.diagnosisName, value: diagnosis?.diagnosisName });
      diagnosisNameCtrl.disable();

      this.disableFields();
    }

  }

  initializeMasterData() {

    const params = ['DIAGNOSIS_STATUS'];

    this.masterService.getCommonMasterData(params).subscribe({
      next: (resp: any) => {
        (resp.data as Array<any>).forEach((res: any) => {
          switch (res.name) {
            case 'DIAGNOSIS_STATUS':
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

  save() {
    if (this.diagnosisForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.diagnosisForm);

      const endDateErrors = this.diagnosisForm.get('endDate')?.errors ?? {};
      const reportedDateErrors = this.diagnosisForm.get('reportedDate')?.errors ?? {};

      if (endDateErrors['onsetAfterEnd']) {
        this.notificationService.showWarning('Onset Date cannot be after the End Date.');
      }

      if (reportedDateErrors['reportedBeforeOnset']) {
        this.notificationService.showWarning('Reported Date cannot be before the Onset Date.');
      }
      return;
    }

    const toUTCDate = (date: Date | null | undefined): Date | null => {
      if (!date) return null;
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    };

    const formValue = this.diagnosisForm.getRawValue();

    this.diagnosisForm.patchValue({
      onsetDate: toUTCDate(formValue.onsetDate),
      reportedDate: toUTCDate(formValue.reportedDate),
      endDate: toUTCDate(formValue.endDate),
      diagnosisName: formValue.diagnosisName?.value ? formValue.diagnosisName?.value : formValue.diagnosisName
    });

    const diagnosisData = { ...this.diagnosisForm.getRawValue() };
    delete diagnosisData['diagnosisId'];

    this.isCallInitiated = true;

    const apiCall = this.selectedDiagnosisId
      ? this.diagnosisService.updateDiagnosis(this.patientId(), this.selectedDiagnosisId, diagnosisData)
      : this.diagnosisService.saveDiagnosis(this.patientId(), diagnosisData);

    apiCall.subscribe({
      next: (resp: any) => {
        this.isVisible.set(false);
        this.isCallInitiated = false;
        this.onDiagnosisUpdate.emit(resp?.data);
      },
      error: (err) => {
        this.isCallInitiated = false;
      },
      complete: () => {
        this.isCallInitiated = false;
      }
    });

    this.onDiagnosisUpdate.emit();
  }

  searchDiagnoses(searchParam: string): void {

    this.diagnosisService.searchDiagnosis(searchParam).subscribe({
      next: (response: any) => {
        if (response?.data?.length > 0) {
          this.diagnosisSuggestion = response?.data;
        } else {
          this.diagnosisSuggestion = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching diagnosis suggestions:', error);
      }
    });

  }

  onSelectDiagnosis(event: any) {
    this.diagnosisForm.get('diagnosisName')?.setValue(event?.value?.value);
  }

  updateStatus(event?: any) {

    const endDateControl = this.diagnosisForm.get('endDate') as FormControl;

    if (this.getStatus?.value == 2) {  //For Resolved
      if (!endDateControl?.hasValidator(Validators.required)) {
        endDateControl?.setValidators(Validators.required);
      }
    } else {
      if (endDateControl?.hasValidator(Validators.required)) {
        endDateControl?.removeValidators(Validators.required);
      }
    }

    if (this.getStatus?.value == 3) {  //For Chronic
      endDateControl.reset();
      endDateControl.disable();
    } else {
      endDateControl.enable();
    }
    endDateControl.updateValueAndValidity();

  }

  disableFields() {
    if (this.getStatus?.value == 2) {  //For Resolved
      this.diagnosisForm.disable();
      const notesControl = this.diagnosisForm.get('notes') as FormControl;
      notesControl.enable();
      notesControl.updateValueAndValidity();
      this.diagnosisForm.updateValueAndValidity();
    }
  }

  onsetBeforeEndValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const onsetControl = group.get('onsetDate');
      const endControl = group.get('endDate');

      const onsetDateValue = onsetControl?.value;
      const endDateValue = endControl?.value;

      if (onsetControl && endControl && onsetDateValue != null && endDateValue != null) {
        const onsetDate = new Date(onsetDateValue);
        const endDate = new Date(endDateValue);

        const onset = new Date(Date.UTC(onsetDate.getFullYear(), onsetDate.getMonth(), onsetDate.getDate()));
        const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

        if (onset && end && new Date(onset) > new Date(end)) {
          endControl.setErrors({ ...endControl.errors, onsetAfterEnd: true });
        } else {
          if (endControl.errors && endControl.errors['onsetAfterEnd']) {
            const { onsetAfterEnd, ...otherErrors } = endControl.errors;
            endControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
          }
        }
      }
      return null;
    };
  }

  reportedAfterOnsetValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const onsetControl = group.get('onsetDate');
      const reportedControl = group.get('reportedDate');

      const onsetDateValue = onsetControl?.value;
      const reportedDateValue = reportedControl?.value;

      if (onsetControl && reportedControl && onsetDateValue != null && reportedDateValue != null) {
        const onsetDate = new Date(onsetDateValue);
        const reportedDate = new Date(reportedDateValue);

        const onset = new Date(Date.UTC(onsetDate.getFullYear(), onsetDate.getMonth(), onsetDate.getDate()));
        const reported = new Date(Date.UTC(reportedDate.getFullYear(), reportedDate.getMonth(), reportedDate.getDate()));

        if (onset && reported && new Date(reported) < new Date(onset)) {
          reportedControl.setErrors({ ...reportedControl.errors, reportedBeforeOnset: true });
        } else {
          if (reportedControl.errors && reportedControl.errors['reportedBeforeOnset']) {
            const { reportedBeforeOnset, ...otherErrors } = reportedControl.errors;
            reportedControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
          }
        }
      }
      return null;
    };
  }

}
