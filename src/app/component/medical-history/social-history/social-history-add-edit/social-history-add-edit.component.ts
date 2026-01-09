import { CommonModule } from '@angular/common';
import { Component, inject, input, model, OnInit, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import { SocialHistoryInterface } from '@interface/social-history.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { SocialHistoryService } from '@service/social-history-service';
import { UtilityService } from '@service/utility.service';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from "primeng/select";
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-social-history-add-edit',
  imports: [ButtonModule,
    DrawerModule,
    DividerModule,
    TranslateModule,
    CommonModule,
    SelectModule,
    AutoCompleteModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    MandatoryFieldLabelDirective,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './social-history-add-edit.component.html',
})
export class SocialHistoryAddEditComponent implements OnInit {
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();
  isVisible = model<boolean>(false);
  socialHistoryId = input.required<string>();
  isCallInitiated = false;
  isBrowser = false;
  tobaccoUseOptions: LabelValue<string>[] = [];
  tobaccoUseFrequencyOptions: LabelValue<string>[] = [];
  alchoholUseOptions: LabelValue<string>[] = [];
  alchoholUseFrequencyOptions: LabelValue<string>[] = [];
  drugUseOptions: LabelValue<string>[] = [];
  filtereddrugUse: LabelValue<string>[] = [];
  excerciseHabitsOptions: LabelValue<string>[] = [];
  maritalStatusOptions: LabelValue<string>[] = [];
  livingSituationOptions: LabelValue<string>[] = [];
  dietaryHabitsOptions: LabelValue<string>[] = [];
  travelHistoryOptions: LabelValue<string>[] = [];
  socialHistoryForm: FormGroup;
  socialHistoryDataUpdate = output<boolean>();


  private readonly platformService = inject(PlatformService);
  private readonly _fb = inject(FormBuilder);
  private readonly masterService = inject(MasterService);
  private readonly socialHistoryService = inject(SocialHistoryService);
  private readonly utilityService = inject(UtilityService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeForm();
    this.initializeMasterData();
    if (this.socialHistoryId()) {
      this.getSocialHistoryById(this.socialHistoryId());
    }
  }

  getSocialHistoryById(socialHistoryId: string): void {
    this.socialHistoryService.getSocialHistoryById<SocialHistoryInterface>(this.patientId(), socialHistoryId).subscribe({
      next: (data) => {
        this.initializeForm(data);
      },
      error: () => {
        this.isVisible.set(false);
      }
    })
  }

  initializeMasterData(): void {
    const params = ['TOBACCO_USE', 'TOBACCO_USE_FREQUENCY', 'ALCHOHOL_USE', 'ALCHOHOL_USE_FREQUENCY', 'DRUG_USE', 'EXCERCISE_HABITS', 'MARITAL_STATUS_HISTORY', 'LIVING_SITUATION', 'DIETARY_HABITS', 'TRAVEL_HISTORY'];
    this.masterService.getCommonMasterData<CommonMaster<unknown>[]>(params).subscribe((data) => {
      data.forEach((res) => {
        switch (res.name) {
          case 'TOBACCO_USE':
            this.tobaccoUseOptions = res.value as LabelValue<string>[];
            break;
          case 'TOBACCO_USE_FREQUENCY':
            this.tobaccoUseFrequencyOptions = res.value as LabelValue<string>[];
            break;
          case 'ALCHOHOL_USE':
            this.alchoholUseOptions = res.value as LabelValue<string>[];
            break;
          case 'ALCHOHOL_USE_FREQUENCY':
            this.alchoholUseFrequencyOptions = res.value as LabelValue<string>[];
            break;
          case 'DRUG_USE':
            this.drugUseOptions = res.value as LabelValue<string>[];
            break;
          case 'EXCERCISE_HABITS':
            this.excerciseHabitsOptions = res.value as LabelValue<string>[];
            break;
          case 'MARITAL_STATUS_HISTORY':
            this.maritalStatusOptions = res.value as LabelValue<string>[];
            break;
          case 'LIVING_SITUATION':
            this.livingSituationOptions = res.value as LabelValue<string>[];
            break;
          case 'DIETARY_HABITS':
            this.dietaryHabitsOptions = res.value as LabelValue<string>[];
            break;
          case 'TRAVEL_HISTORY':
            this.travelHistoryOptions = res.value as LabelValue<string>[];
            break;
          default:
            console.debug('name not found', res.name);
            break;
        }
      })
    })
  }

  initializeForm(history?: SocialHistoryInterface): void {
    const appointmentId = this.appointmentId();
    const patientId = this.patientId();
    this.socialHistoryForm = this._fb.group({
      socialHistoryId: new FormControl<string | null>({ value: history?.socialHistoryId, disabled: true }),
      tobaccoUse: new FormControl<string | null>(
        history?.tobaccoUse || null,
        [Validators.required]
      ),
      tobaccoUseFrequency: new FormControl<string | null>(
        history?.tobaccoUseFrequency || null,
      ),
      alchoholUse: new FormControl<string | null>(
        history?.alchoholUse || null,
        [Validators.required]
      ),
      alchoholUseFrequency: new FormControl<string | null>(
        history?.alchoholUseFrequency || null,
      ),
      drugUse: new FormControl<string | null>(
        history?.drugUse || null,
        [Validators.required]
      ),
      drugUseType: new FormControl<string | null>(
        history?.drugUseType || null,
      ),
      occupation: new FormControl<string | null>(
        history?.occupation || null,
      ),
      excerciseHabits: new FormControl<string | null>(
        history?.excerciseHabits || null,
      ),
      maritalStatus: new FormControl<string | null>(
        history?.maritalStatus || null,
      ),
      livingSituation: new FormControl<string | null>(
        history?.livingSituation || null,
      ),
      dietaryHabits: new FormControl<string | null>(
        history?.dietaryHabits || null,
      ),
      travelHistory: new FormControl<string | null>(
        history?.travelHistory || null,
      ),
      patientId: [patientId, { disabled: true }],
      appointmentId: new FormControl(appointmentId)
    });
  }

  save(): void {
    if (this.socialHistoryForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.socialHistoryForm);
      return;
    }
    const formData = this.socialHistoryForm.getRawValue();
    this.isCallInitiated = true;

    const apiCall = this.socialHistoryId()
      ? this.socialHistoryService.updateSocialHistory(this.patientId(), this.socialHistoryId(), formData)
      : this.socialHistoryService.addSocialHistory(this.patientId(), formData);
    apiCall.subscribe({
      next: () => {
        this.isVisible.set(false);
        this.socialHistoryDataUpdate.emit(true);
      },
      error: (error) => {
        this.isCallInitiated = false;
        console.error(error);
      }
    });
  }

  ondrugUseTypeSelect(event: AutoCompleteSelectEvent): void {
    this.socialHistoryForm.patchValue({
      drugUseType: event.value.label
    });
  }

  searchdrugUseType(searchParam: string): void {
    this.socialHistoryService.getDrugUseTypes(searchParam).subscribe({
      next: (data: LabelValue<string>[]) => {
        if (data) {
          const hasExactMatch = data.some(
            (item: LabelValue<string>) => item.label?.toLowerCase() === searchParam.trim().toLowerCase()
          );

          this.filtereddrugUse = hasExactMatch
            ? data
            : [...data, { label: searchParam, value: searchParam }];
        } else {
          this.filtereddrugUse = [{ label: searchParam, value: searchParam }];
        }
      },
      error: (error) => {
        console.error('Error fetching vaccine suggestions:', error);
      }
    });
  }

}
