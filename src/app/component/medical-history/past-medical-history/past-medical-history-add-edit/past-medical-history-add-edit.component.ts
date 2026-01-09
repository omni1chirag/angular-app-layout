import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, model, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { PastHistoryInterface } from '@interface/past-history.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { PastMedicalHistoryService } from '@service/past-medical-history.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-past-medical-history-add-edit',
  imports: [DrawerModule,
    ButtonModule,
    DividerModule,
    TranslateModule,
    AutoCompleteModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    MandatoryFieldLabelDirective,
    FileUploadComponent,
    DateMaskDirective,
    CommonModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './past-medical-history-add-edit.component.html',
})
export class PastMedicalHistoryAddEditComponent implements OnInit {

  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  isVisible = model<boolean>(false);
  isBrowser = false;
  pastMedicalHistoryId = input.required<string>();
  filteredmedicalCondition: LabelValue<string>[] = [];
  pastHistoryForm: FormGroup;
  maxDate: Date | undefined;
  minDate: Date | undefined;
  statusOptions: LabelValue<string>[] = [];
  isCallInitiated = false;
  moduleId = 11;
  subModuleId = 18;
  mode: 'ADD_PAST_MEDICAL_HISTORY' | 'EDIT_PAST_MEDICAL_HISTORY' = 'ADD_PAST_MEDICAL_HISTORY';
  supportedTypes = ".jpeg,.png,.jpg,.pdf";
  today: Date = new Date();
  yesterday: Date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 1);
  pastHistoryUpdate = output<boolean>();

  getPastHistoryId(): string {
    return this.pastHistoryForm.get('pastMedicalHistoryId')?.value;
  }

  private readonly platformService = inject(PlatformService);
  private readonly _fb = inject(FormBuilder);
  private readonly masterService = inject(MasterService);
  private readonly pastHistoryService = inject(PastMedicalHistoryService);
  private readonly utilityService = inject(UtilityService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
    this.initializeForm();

    if (this.pastMedicalHistoryId()) {
      this.getPastHistoryById(this.pastMedicalHistoryId());
    }
  }

  getPastHistoryById(pastMedicalHistoryId: string): void {
    this.pastHistoryService.getPastHistoryById<PastHistoryInterface>(this.patientId(), pastMedicalHistoryId).subscribe({
      next: (data) => {
        this.initializeForm(data);
      },
      error: () => {
        this.isVisible.set(false);
      }
    })
  }

  initializeMasterData(): void {
    const params = ['PAST_HISTORY_STATUS'];
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        if (res.name == 'PAST_HISTORY_STATUS') {
          this.statusOptions = res.value as LabelValue<string>[];
        } else {
          console.debug('name not found', res.name);
        }
      })
    })
  }

  initializeForm(history?: PastHistoryInterface): void {
    const appointmentId = this.appointmentId();
    const patientId = this.patientId();
    this.pastHistoryForm = this._fb.group({
      pastMedicalHistoryId: new FormControl<string | null>({ value: history?.pastMedicalHistoryId, disabled: true }),
      medicalCondition: new FormControl<string | null>(
        history?.medicalCondition || null,
        [Validators.required]
      ),
      diagnosisDate: new FormControl<Date | null>(
        history?.diagnosisDate ? new Date(history.diagnosisDate) : null,
        [Validators.required]
      ),
      status: new FormControl<string | null>(
        history?.status || null,
        [Validators.required]
      ),
      notes: new FormControl<string | null>(
        history?.notes || null, [Validators.maxLength(100)]
      ),
      attachReports: new FormControl<string>(undefined),
      patientId: new FormControl<string | null>(patientId, [Validators.required]),
      appointmentId: new FormControl(history?.appointmentId ?? appointmentId)
    });
  }

  searchmedicalCondition(searchParam: string): void {
    this.pastHistoryService.getMedicalConditions(searchParam).subscribe({
      next: (data: LabelValue<string>[]) => {
        if (data) {
          const hasExactMatch = data.some(
            (item: LabelValue<string>) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.filteredmedicalCondition = hasExactMatch
            ? data
            : [...data, { label: searchParam, value: searchParam }];
        } else {
          this.filteredmedicalCondition = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching vaccine suggestions:', error);
      }
    });
  }

  onMedicalConditionSelect(event: { value: LabelValue<string> }): void {
    this.pastHistoryForm.patchValue({
      medicalCondition: event.value.label
    });
  }


  save(): void {
    if (this.pastHistoryForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.pastHistoryForm);
      return;
    }
    const formData = this.pastHistoryForm.value;
    this.isCallInitiated = true;

    const apiCall = this.pastMedicalHistoryId()
      ? this.pastHistoryService.updatePastMedicalHistory(this.patientId(), this.pastMedicalHistoryId(), formData)
      : this.pastHistoryService.addPastMedicalHistory(this.patientId(), formData);
    apiCall.subscribe({
      next: () => {
        this.pastHistoryUpdate.emit(true);
        this.isVisible.set(false);
      },
      error: (error) => {
        this.isCallInitiated = false;
        console.error(error);
      }
    });
  }

}
