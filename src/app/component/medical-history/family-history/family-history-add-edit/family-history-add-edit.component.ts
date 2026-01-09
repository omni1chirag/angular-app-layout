import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, input, model, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { REGEX } from '@constants/regex.constant';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { FamilyHistoryInterface } from '@interface/family-history.interface';
import { TranslateModule } from '@ngx-translate/core';
import { FamilyHistoryService } from '@service/family-history.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputNumber } from "primeng/inputnumber";
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-family-history-add-edit',
  imports: [DrawerModule,
    DividerModule,
    ButtonModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TextareaModule,
    AutoCompleteModule,
    SelectModule,
    InputTextModule,
    ToggleSwitchModule,
    MandatoryFieldLabelDirective, 
    InputNumber,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './family-history-add-edit.component.html',
})
export class FamilyHistoryAddEditComponent implements OnInit {

  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  isVisible = model<boolean>(false);
  familyHistoryId = input.required<string>();
  isCallInitiated = false;
  familyHistoryForm: FormGroup;
  relationOptions: LabelValue<string>[] = [];
  filteredCondition: LabelValue<string>[] = [];
  isBrowser = false;
  numeric: RegExp = REGEX.NUMERIC;
  familyHistoryUpdate = output<boolean>();


  getfamilyHistoryId(): string {
    return this.familyHistoryForm.get('familyHistoryId')?.value;
  }

  private readonly platformService = inject(PlatformService);
  private readonly _fb = inject(FormBuilder);
  private readonly masterService = inject(MasterService);
  private readonly familyHistoryService = inject(FamilyHistoryService);
  private readonly utilityService = inject(UtilityService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeForm();
    this.initializeMasterData();

    if (this.familyHistoryId()) {
      this.getFamilyHistoryById(this.familyHistoryId());
    }
  }

  getFamilyHistoryById(familyHistoryId: string): void {
    this.familyHistoryService.getFamilyHistoryById<FamilyHistoryInterface>(this.patientId(), familyHistoryId).subscribe({
      next: (data) => {
        this.initializeForm(data);
      },
      error: () => {
        this.isVisible.set(false);
      }
    })
  }

  initializeMasterData(): void {
    const params = ['FAMILY_HISTORY_RELATION'];
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        if (res.name == 'FAMILY_HISTORY_RELATION') {
          this.relationOptions = res.value as LabelValue<string>[];
        } else {
          console.debug('name not found', res.name);
        }
      })
    })
  }

  initializeForm(history?: FamilyHistoryInterface): void {
    const appointmentId = this.appointmentId();
    const patientId = this.patientId();
    this.familyHistoryForm = this._fb.group({
      familyHistoryId: new FormControl<string | null>({ value: history?.familyHistoryId, disabled: true }),
      relation: new FormControl<string | null>(
        history?.relation || null,
        [Validators.required]
      ),
      healthCondition: new FormControl<string | null>(
        history?.healthCondition || null,
        [Validators.required]
      ),
      age: new FormControl<number | null>(
        history?.age || null,
        [Validators.pattern(this.numeric), Validators.maxLength(3)],
      ),
      isDeceased: new FormControl<boolean | null>(
        history?.isDeceased || false
      ),
      causeOfDeath: new FormControl<string | null>(
        history?.causeOfDeath || null,
      ),
      notes: new FormControl<string | null>(
        history?.notes || null,
      ),
      patientId: new FormControl<string | null>(patientId, [Validators.required]),
      appointmentId: new FormControl(history?.appointmentId ?? appointmentId)
    });
  }


  save(): void {
    if (this.familyHistoryForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.familyHistoryForm);
      return;
    }
    const formData = this.familyHistoryForm.value;
    this.isCallInitiated = true;

    const apiCall = this.familyHistoryId()
      ? this.familyHistoryService.updateFamilylHistory(this.patientId(), this.familyHistoryId(), formData)
      : this.familyHistoryService.addFamilyHistory(this.patientId(), formData);
    apiCall.subscribe({
      next: () => {
        this.familyHistoryUpdate.emit(true);
        this.isVisible.set(false);
      },
      error: (error) => {
        this.isCallInitiated = false;
        console.error(error);
      }
    });
  }

  onConditionSelect(event: AutoCompleteSelectEvent): void {
    this.familyHistoryForm.patchValue({
      healthCondition: event.value.label
    });
  }

  searchCondition(searchParam: string): void {

    this.familyHistoryService.getHealthConditions(searchParam).subscribe({
      next: (data: LabelValue<string>[]) => {
        if (data) {
          const hasExactMatch = data.some(
            (item: LabelValue<string>) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.filteredCondition = hasExactMatch
            ? data
            : [...data, { label: searchParam, value: searchParam }];
        } else {
          this.filteredCondition = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching vaccine suggestions:', error);
      }
    });
  }
}
