import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, input, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { Allergen, AllergicReaction } from '@interface/allergy.interface';
import { LabelValue } from '@interface/common-master.interface';
import { Allergy } from '@model/allergy.model';
import { TranslateModule } from '@ngx-translate/core';
import { AllergyService } from '@service/allergy.service';
import { MasterService } from '@service/master.service';
import { UtilityService } from '@service/utility.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButton } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-allergy-add-edit',
  imports: [
    DrawerModule,
    ButtonModule,
    DividerModule,
    MandatoryFieldLabelDirective,
    InputTextModule,
    SelectButton,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    MultiSelectModule,
    DatePickerModule,
    MandatoryFieldLabelDirective,
    TextareaModule,
    FileUploadComponent,
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './allergy-add-edit.component.html',
  styleUrl: './allergy-add-edit.component.scss'
})
export class AllergyAddEditComponent implements OnInit {

  @Input() isVisible: boolean = false;
  @Output() isVisibleChange = new EventEmitter<boolean>();
  @Input() selectedAllergy!: WritableSignal<Allergy>;
  patientId = input.required<string>();
  appointmentId = input.required<string>();
  _selectedAllergy = new Allergy();
  isMasterDataLoaded = signal(false);
  masterAllergens: Allergen[] = [];
  today: Date = new Date();
  allergyForm!: FormGroup;
  types: LabelValue[] = [];
  allergenSuggestions: Allergen[] = [];
  AllergyStatuses: LabelValue[] = [];
  severities: LabelValue[] = [];
  reactionStatus: LabelValue[] = []
  reactionOptions: AllergicReaction[] = [];
  objectId: string;
  documentTypes = ".jpeg,.png,.jpg";
  allergy: Allergy = new Allergy;
  notes: string;
  isLoading = false;
  error: string | null = null;



  private subscriptions = new Subscription();

  onHide() {
    this.allergyForm.reset();
    this.allergy = null;
    this.isVisible = false;
    this.isVisibleChange.emit(false);
  }

  constructor(
    private allergyService: AllergyService,
    private masterService: MasterService,
    private fb: FormBuilder,
    private utilityService: UtilityService,
  ) {
    this.initializeMasterData();
    this.initializeForm();

    effect(() => {
      if (this.selectedAllergy()) {
        this._selectedAllergy = this.selectedAllergy();
        if(this._selectedAllergy.allergyId) {
          this.fetchPatientAllergy(this._selectedAllergy.allergyId);
        } else {
          this.patchAllergyForm(this._selectedAllergy);
        }
        
      }
    });
  }

  ngOnInit(): void {
    this.initializeAllergenData();
  }


  patchAllergyForm(allergy: Allergy) {
    this.allergyForm.patchValue({
      allergyId: allergy.allergyId,
      allergenName: allergy.allergenName,
      allergenType: allergy.allergenType,
      allergyStatus: allergy.allergyStatus,
      severity: allergy.severity,
      reactionStatus: allergy.reactionStatus,
      reactionSymptoms: allergy.reactionSymptoms,
      onsetDate: allergy.onsetDate ? new Date(allergy.onsetDate + 'T00:00:00') : null,
      recordedDate: allergy.recordedDate ? new Date(allergy.recordedDate + 'T00:00:00') : null,
      notes: allergy.notes,
      reports: allergy.reports
    });
  }

  initializeAllergenData() {
    this.subscriptions.add(
      this.allergyService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.add(
      this.allergyService.error$.subscribe(error => {
        this.error = error;
      })
    );

    this.subscriptions.add(
      this.allergyService.allergyData$.subscribe(data => {
        // this.allergenSuggestions = data.allergens;
        this.masterAllergens = data.allergens
        this.reactionOptions = data.allergicReactions
      })
    );
  }

  initializeForm(alg?: Allergy) {
    this.allergyForm = this.fb.group({
      allergyId: new FormControl<string | null>(alg?.allergyId ?? null),
      allergenType: new FormControl<string | null>({ value: alg?.allergenType, disabled: true }, [Validators.required]),
      allergenName: new FormControl<string | null>(alg?.allergenName, [Validators.required]),
      allergyStatus: new FormControl<string | null>(alg?.allergyStatus, [Validators.required]),
      severity: new FormControl<string | null>(alg?.severity, [Validators.required]),
      reactionStatus: new FormControl<string | null>(alg?.reactionStatus ?? null),
      reactionSymptoms: new FormControl<string[] | null>((alg?.reactionSymptoms || []).map((mode: any) => mode.name || mode)),
      onsetDate: new FormControl<Date | null>(
        alg?.onsetDate ? new Date(alg.onsetDate + 'T00:00:00') : null,
      ),
      recordedDate: new FormControl<Date | null>(
        alg?.recordedDate ? new Date(alg.recordedDate + 'T00:00:00') : null,
      ),
      notes: new FormControl<string | null>(alg?.notes ?? null),
      reports: new FormControl<string | null>(alg?.reports ?? null)
    });

    this.enableReactionSymptoms();
    this.enableAllergenType();

  }

  enableReactionSymptoms() {
    this.allergyForm.get('reactionStatus')?.valueChanges.subscribe((value: string | null) => {
      const symptomControl = this.allergyForm.get('reactionSymptoms');
      if (value === 'YES') {
        symptomControl?.enable();
        symptomControl?.setValidators([Validators.required]);
      } else {
        symptomControl?.disable();
        symptomControl?.clearValidators();
        symptomControl?.setValue([]);
      }

      symptomControl?.updateValueAndValidity();

    });
  }

  enableAllergenType() {
    this.allergyForm.get('allergenName')?.valueChanges.subscribe(name => {
      const allergenTypeControl = this.allergyForm.get('allergenType');
      const isFromMaster = this.masterAllergens.some(a => a.allergenName === name);

      if (isFromMaster) {
        allergenTypeControl?.disable({ emitEvent: false });

        // Optional: auto-fill allergenType if found
        const matched = this.masterAllergens.find(a => a.allergenName === name);
        allergenTypeControl?.setValue(matched?.allergenType || null, { emitEvent: false });
      } else {
        allergenTypeControl?.enable({ emitEvent: false });
        allergenTypeControl?.setValue(null, { emitEvent: false });
      }

      allergenTypeControl?.updateValueAndValidity();
    });
  }

  initializeMasterData() {
    const params = ['ALLERGY_CATEGORIES', 'ALLERGY_STATUS', 'ALLERGY_SEVERITY', 'ALLERGY_REACTION']

    this.masterService.getCommonMasterData(params).subscribe({
      next: (resp: any) => {
        (resp.data as Array<any>).forEach((res: any) => {
          switch (res.name) {
            case 'ALLERGY_CATEGORIES':
              this.types = res.value
              break;
            case 'ALLERGY_STATUS':
              this.AllergyStatuses = res.value
              break;
            case 'ALLERGY_SEVERITY':
              this.severities = res.value
              break;
            case 'ALLERGY_REACTION':
              this.reactionStatus = res.value
              break;
            default:
              console.error('master data name not found', res.name);
              break;
          }
          this.isMasterDataLoaded.set(true);
        })
      },
      error: (error) => {
        console.error('Error while fetching master data:', error);
        this.isMasterDataLoaded.set(false);
      }
    });
  }

  submitAllergyForm(id: string | null) {
    if (this.allergyForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.allergyForm);
      const totalErrors = this.utilityService.getFormValidationErrors(this.allergyForm);
      console.log('total errors in a allergy form :', totalErrors)
      return;
    }
    const onset = this.allergyForm.value.onsetDate;
    const fixedOnset = onset ? new Date(Date.UTC(onset.getFullYear(), onset.getMonth(), onset.getDate())) : null;
    this.allergyForm.patchValue({ onsetDate: fixedOnset });

    const recorded = this.allergyForm.value.recordedDate;
    const fixedRecorded = recorded ? new Date(Date.UTC(recorded.getFullYear(), recorded.getMonth(), recorded.getDate())) : null;
    this.allergyForm.patchValue({ recordedDate: fixedRecorded });

    this.allergy = this.allergyForm.getRawValue();
    
    if(this.appointmentId() != null && this.appointmentId() != undefined) {
      this.allergy.appointmentId = this.appointmentId();
    }

    id ? this.updateAllergy(id) : this.createAllergy();
  }

  updateAllergy(allergyId: string) {
    this.allergyService.updateAllergy(this.allergy, this.patientId(), allergyId).subscribe({
      next: () => {
        this.onHide();
      },
      error: (error) => {
        console.error('error while updating allergy : ', error);
        this.onHide();
      }
    });
  }

  createAllergy() {
    this.allergyService.createAllergy(this.allergy, this.patientId()).subscribe({
      next: () => {
        this.onHide();
      },
      error: (error) => {
        console.error('error while creating allergy : ', error)
        this.onHide();
      }
    });
  }

  searchAllergens(query: string) {
    const filtered = this.masterAllergens.filter(allergen =>
      allergen.allergenName.toLowerCase().includes(query.toLowerCase())
    );

    const customEntry = {
      allergenName: query,
      allergenType: 'Other',
      allergenId: null
    };

    const exactMatch = filtered.some(allergen => allergen.allergenName.toLowerCase() === query.toLowerCase());
    this.allergenSuggestions = exactMatch ? filtered : [...filtered, customEntry];
  }

  allergenToAllergy(allergen: Allergen) {
    this._selectedAllergy.allergenName = allergen.allergenName;
    this._selectedAllergy.allergenType = allergen.allergenType;
    this._selectedAllergy.allergyStatus = 'ACTIVE'
    this.patchAllergyForm(this._selectedAllergy);
  }


  fetchPatientAllergy(allrgyId: string) {
    this.allergyService.fetchPatientAllergyById(this.patientId(), allrgyId).subscribe({
      next: (resp) => {
        this._selectedAllergy = resp.data;
        this.patchAllergyForm(this._selectedAllergy);
      },
      error: (error) => {
        console.error('Error fetching allergy by ID:', error);
      }
    });
  }
} 
