import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, model, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { SurgicalHistoryInterface } from '@interface/surgical-history.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { SurgicalHistoryService } from '@service/surgical-history.service';
import { UtilityService } from '@service/utility.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-surgical-history-add-edit',
  imports: [
    DrawerModule,
    DividerModule,
    ButtonModule,
    TranslateModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    FileUploadComponent,
    DateMaskDirective,
    MandatoryFieldLabelDirective,
    CommonModule,
    InputTextModule,
    FormsModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './surgical-history-add-edit.component.html',
})
export class SurgicalHistoryAddEditComponent implements OnInit {
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  isVisible = model<boolean>(false);
  surgicalHistoryId = input.required<string>();
  isCallInitiated = false;
  surgicalHistoryForm: FormGroup;
  filteredSurgeryName: LabelValue<string>[] = [];
  isBrowser = false;
  statusOptions: LabelValue<string>[] = [];
  surgeryTypeOptions: LabelValue<string>[] = [];
  today: Date = new Date();
  yesterday: Date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 1);
  moduleId = 11;
  subModuleId = 19;
  mode: 'ADD_SURGICAL_HISTORY' | 'EDIT_SURGICAL_HISTORY' = 'ADD_SURGICAL_HISTORY';
  supportedTypes = ".jpeg,.png,.jpg,.pdf";
  surgicalHistoryUpdate = output<boolean>();

  getSurgicalHistoryId(): string {
    return this.surgicalHistoryForm.get('surgicalHistoryId')?.value;
  }

  private readonly platformService = inject(PlatformService);
  private readonly _fb = inject(FormBuilder);
  private readonly masterService = inject(MasterService);
  private readonly utilityService = inject(UtilityService);
  private readonly sugicalHistoryService = inject(SurgicalHistoryService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
    this.initializeForm();

    if (this.surgicalHistoryId()) {
      this.getSurgicalHistoryById(this.surgicalHistoryId());
    }
  }

  getSurgicalHistoryById(surgicalHistoryId: string): void {
    this.sugicalHistoryService.getSurgicalHistoryById<SurgicalHistoryInterface>(this.patientId(), surgicalHistoryId).subscribe({
      next: (data) => {
        this.initializeForm(data);
      },
      error: () => {
        this.isVisible.set(false);
      }
    })
  }

  initializeMasterData(): void {
    const params = ['SURGICAL_HISTORY_STATUS', 'MEDICAL_SURGERY_TYPE'];
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        switch (res.name) {
          case 'SURGICAL_HISTORY_STATUS':
            this.statusOptions = res.value as LabelValue<string>[];
            break;
          case 'MEDICAL_SURGERY_TYPE':
            this.surgeryTypeOptions = res.value as LabelValue<string>[];
            break;
          default:
            console.debug('name not found', res.name);
            break;
        }
      })
    })
  }

  initializeForm(history?: SurgicalHistoryInterface): void {
    const appointmentId = this.appointmentId();
    const patientId = this.patientId();
    this.surgicalHistoryForm = this._fb.group({
      surgicalHistoryId: new FormControl<string | null>({ value: history?.surgicalHistoryId, disabled: true }),
      surgeryName: new FormControl<string | null>(
        history?.surgeryName || null,
        [Validators.required]
      ),
      surgeryDate: new FormControl<Date | null>(
        history?.surgeryDate ? new Date(history.surgeryDate) : null,
        [Validators.required]
      ),
      hospitalName: new FormControl<string | null>(
        history?.hospitalName || null,
        [Validators.required]
      ),
      doctorName: new FormControl<string | null>(
        history?.doctorName || null,
        [Validators.required]
      ),
      notes: new FormControl<string | null>(
        history?.notes || null,
      ),
      status: new FormControl<string | null>(
        history?.status || null,
        [Validators.required]
      ),
      surgeryType: new FormControl<string | null>(
        history?.surgeryType || null,
        [Validators.required]
      ),
      attachReports: new FormControl<string | null>(undefined),
      patientId: new FormControl<string | null>(patientId, [Validators.required]),
      appointmentId: new FormControl(appointmentId)
    });
  }

  searchSurgeryName(searchParam: string): void {
    this.sugicalHistoryService.getMedicalConditions(searchParam).subscribe({
      next: (data: LabelValue<string>[]) => {
        if (data) {
          const hasExactMatch = data.some(
            (item: LabelValue<string>) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.filteredSurgeryName = hasExactMatch
            ? data
            : [...data, { label: searchParam, value: searchParam }];
        } else {
          this.filteredSurgeryName = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching vaccine suggestions:', error);
      }
    });
  }

  onSurgeryNameSelect(event: { value: LabelValue<string> }): void {
    this.surgicalHistoryForm.patchValue({
      surgeryName: event.value.label
    });
  }

  save(): void {
    if (this.surgicalHistoryForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.surgicalHistoryForm);
      return;
    }
    const formData = this.surgicalHistoryForm.value;
    this.isCallInitiated = true;

    const apiCall = this.surgicalHistoryId()
      ? this.sugicalHistoryService.updateSurgicalMedicalHistory(this.patientId(), this.surgicalHistoryId(), formData)
      : this.sugicalHistoryService.addSurgicalMedicalHistory(this.patientId(), formData);
    apiCall.subscribe({
      next: () => {
        this.surgicalHistoryUpdate.emit(true);
        this.isVisible.set(false);
      },
      error: (error) => {
        this.isCallInitiated = false;
        console.error(error);
      }
    });
  }
}
