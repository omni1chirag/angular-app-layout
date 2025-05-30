import { CommonModule } from '@angular/common';
import { Component, model, Output, input, Input, effect, OnInit, EventEmitter, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { UtilityService } from '@service/utility.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PatientLabService } from '@service/patient-lab.service';
import { NotificationService } from '@service/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { L } from 'node_modules/@angular/cdk/data-source.d-7cab2c9d';
import { HttpParams } from '@angular/common/http';


interface LabelValue {
  label: string;
  value: any;
}

@Component({
  selector: 'app-lab-add-edit',
  imports: [
    TranslateModule,
    DividerModule,
    ButtonModule,
    DrawerModule,
    CommonModule,
    SelectButtonModule,
    SelectModule,
    ReactiveFormsModule,
    FormsModule,
    CalendarModule,
    DatePickerModule,
    TextareaModule,
    MandatoryFieldLabelDirective,
    InputTextModule,
  ],
  templateUrl: './lab-add-edit.component.html',
})
export class LabAddEditComponent implements OnInit {
  labId: string;
  @Input("isVisible")
  set setIsVisible(value: boolean) {
    this.isVisible.set(value);
  }

  @Output("isVisible")
  get getIsVisible(): boolean {
    return this.isVisible();
  }
  isVisible = model<boolean>(false);
  labForm: FormGroup;
  // selectedLab = input<any>();
  @Input() selectedLab: any;
  isCallInitiated: boolean = false;
  testNameOptions: LabelValue[] = [];
  testTypeOptions: LabelValue[] = [];
  appointmentOptions: LabelValue[] = [];
  providerOptions: LabelValue[] = [];
  statusOptions: LabelValue[] = [];
  sampleRequiredOptions: LabelValue[] = [];
  sampleLocationOptions: LabelValue[] = [];
  currentDate: Date | undefined;
  @Output() onLabOrderUpdate = new EventEmitter<any>();
  patientId: string;

  constructor(private _fb: FormBuilder,
    private masterService: MasterService,
    private utilityService: UtilityService,
    private patientLabService: PatientLabService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
    effect(() => {
      this.initializeMasterData();
      this.initializeForm(this.selectedLab);
    });
  }

  ngOnInit() {
    const { params } = this.activatedRoute.snapshot;
    this.patientId = params['id'];
    if (!this.patientId) {
      const { params } = this.activatedRoute.parent?.snapshot;
      this.patientId = params['id'];
    }
    this.initializeForm();

    if (this.selectedLab) {
      this.labId = this.selectedLab.labId;
      this.labForm.patchValue(this.selectedLab);
    }
    
    this.getAppointmentLabels()
  }

  initializeForm(labOrder?: any) {
    if(labOrder && labOrder.labId) {
      this.patientLabService.getLabOrderById(this.patientId, labOrder.labId).subscribe({
        next: (resp: any) => {
          const data = resp.data;
          this.labId = data.labId;
      
          this.labForm.patchValue({
            ...data,
            orderDate: data.orderDate ? new Date(data.orderDate) : null,
            testDate: data.testDate ? new Date(data.testDate) : null
          });
        },
        error: (error) => {
          console.error('Error fetching lab order by ID:', error);
        }
      });
    }

    this.labForm = this._fb.group({
      labId: new FormControl<string | null>({ value: labOrder?.labId, disabled: true}),
      testName: new FormControl<string | null>(labOrder?.testName ?? null, [Validators.required]),
      testType: new FormControl<string | null>(labOrder?.testType ?? null, [Validators.required]),
      orderDate: new FormControl<Date | null>(
        labOrder?.orderDate ? new Date(labOrder.orderDate) : null,
        [Validators.required]
      ),
      testDate: new FormControl<Date | null>(
        labOrder?.testDate ? new Date(labOrder.testDate) : null,
        [Validators.required]
      ),
      appointmentId: new FormControl<string | null>(labOrder?.appointmentId ?? null),
      reasonForTest: new FormControl<string | null>(labOrder?.reasonForTest ?? '', [Validators.maxLength(1000)]),
      orderingProvider: new FormControl<string | null>(labOrder?.orderingProvider ?? null, [Validators.required]),
      sampleRequired: new FormControl<string | null>(labOrder?.sampleRequired ?? null),
      sampleCollectionLocation: new FormControl<string | null>(labOrder?.sampleCollectionLocation ?? null, [Validators.required]),
      testInstructions: new FormControl<string | null>(labOrder?.testInstructions ?? '', [Validators.maxLength(1000)]),
      status: new FormControl<string | null>((labOrder?.status ?? '1') + '', [Validators.required])
    });
  }
  
  initializeMasterData(){
    this.masterService.getTestName().subscribe({
      next: (resp: any) => {
        this.testNameOptions = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Test Names :', error);
      }
    });
    this.masterService.getTestType().subscribe({
      next: (resp: any) => {
        this.testTypeOptions = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Test Types :', error);
      }
    });
    this.masterService.getLabSampleName().subscribe({
      next: (resp: any) => {
        this.sampleRequiredOptions = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Lab Sample Names :', error);
      }
    });
    this.masterService.getLabSampleCollecionLocation().subscribe({
      next: (resp: any) => {
        this.sampleLocationOptions = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Lab Sample Collection Locations :', error);
      }
    });
    this.masterService.getPatientLabStatus().subscribe({
      next: (resp: any) => {
        this.statusOptions = resp.data;
      },
      error: (error) => {
        console.error('Error fetching Lab Statuses :', error);
      }
    });
  }
  
  appointmentChange(event: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { appointmentId: event.value },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  getAppointmentLabels(): void {
    const clinicId = localStorage.getItem('currentlyUsedClinic');
    if (!clinicId) return;

    const params = new HttpParams()
      .set('patientId', this.patientId)
      .set('clinicId', clinicId);

    this.patientLabService.getAppointmentLabels(params).subscribe((resp: any) => {
      this.appointmentOptions = resp.data;
    });
  }

  save() {
    if (this.labForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.labForm);
      return;
    }
  
    const formValue = this.labForm.value;
  
    // Convert orderDate and testDate to UTC
    const orderDate = formValue.orderDate
      ? new Date(Date.UTC(
        formValue.orderDate.getFullYear(),
        formValue.orderDate.getMonth(),
        formValue.orderDate.getDate()
      ))
      : null;
  
    const testDate = formValue.testDate
      ? new Date(Date.UTC(
        formValue.testDate.getFullYear(),
        formValue.testDate.getMonth(),
        formValue.testDate.getDate()
      ))
      : null;
  
    this.labForm.patchValue({
      orderDate,
      testDate
    });
  
    const { params } = this.activatedRoute.snapshot;
    this.patientId = params['id'];
    if (!this.patientId) {
      const { params } = this.activatedRoute.parent?.snapshot;
      this.patientId = params['id'];
    }
  
    const labOrderData = {
      ...this.labForm.getRawValue(),
    };
  
    this.isCallInitiated = true;
  
    const apiCall = this.labId
      ? this.patientLabService.updateLabOrder(this.patientId, this.labId, labOrderData)
      : this.patientLabService.createLabOrder(this.patientId, labOrderData);

    apiCall.subscribe({
      next: (resp: any) => {
        this.isCallInitiated = false;
        this.isVisible.set(false);
        this.onLabOrderUpdate.emit(resp.data);
      },
      error: (error) => {
        this.isCallInitiated = false;
        console.error(error);
      },
      complete: () => {
        this.isCallInitiated = false;
      }
    });
  }    
}
