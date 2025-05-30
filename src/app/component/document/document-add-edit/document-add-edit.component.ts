import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, model, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '@service/document.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MasterService } from '@service/master.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-document-add-edit',
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    MandatoryFieldLabelDirective,
    DividerModule,
    DrawerModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    FileUploadComponent,
    DatePickerModule,
    TextareaModule,
    CommonModule,
  ],
  templateUrl: './document-add-edit.component.html',
  styleUrl: './document-add-edit.component.scss'
})
export class DocumentAddEditComponent implements OnInit, OnDestroy {

  isVisible = model<boolean>(false);

  readonly documentId = input.required<string>();
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();

  isCallInitiated = false;
  documentForm: FormGroup;
  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/);
  documentTypes: Array<any> = [];
  supportedTypes = ".jpeg,.png,.jpg,.pdf";
  isBrowser: boolean = false;
  moduleId: number = 1;
  subModuleId: number = 1;
  formSubscription$ = new Subject<void>();
  mode: 'ADD_DOCUMENT' | 'EDIT_DOCUMENT' = 'ADD_DOCUMENT';

  @Output() onDocumentUpdate = new EventEmitter<any>();

  @Input("isVisible")
  set setIsVisible(value: boolean) {
    this.isVisible.set(value);
  }

  @Output("isVisible")
  get getIsVisible(): boolean {
    return this.isVisible();
  }

  get getDocumentId() {
    return this.documentForm.get('documentId')?.value;
  }

  get isDocumentTypeFreeText() {
    return 0 == this.documentForm?.get('docTypeId').value;
  }

  constructor(private _fb: FormBuilder,
    private utilityService: UtilityService,
    private documentService: DocumentService,
    private platformService: PlatformService,
    private masterService: MasterService
  ) {
    this.isBrowser = this.platformService.isBrowser();
  }
  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
    if (this.documentId()) {
      this.getDocument(this.documentId());
    } else {
      this.initializeForm();
    }
  }

  ngOnDestroy(): void {
    this.formSubscription$.next();
    this.formSubscription$.complete();
  }

  getDocument(documentId) {
    this.mode = 'EDIT_DOCUMENT';
    this.documentService.getDocument(documentId).subscribe({
      next: (resp: any) => {
        this.initializeForm(resp.data);
      },
      error: (err: any) => {
        this.isVisible.set(false);
      }
    })
  }

  initializeMasterData() {
    this.masterService.getDocumentTypes().subscribe((resp: any) => {
      if (resp && resp.data) {
        this.documentTypes = resp.data;
      }
    });
  }

  initializeForm(document?) {
    this.documentForm = this._fb.group({
      documentId: new FormControl<String | null>({ value: document?.documentId, disabled: true }),
      docTitle: new FormControl<string | null>(document?.docTitle, [Validators.required, Validators.maxLength(100)]),
      docTypeId: new FormControl<number | null>(document?.docTypeId, [Validators.required]),
      docTypeFreeText: new FormControl<string | null>(document?.docTypeFreeText),
      docDescription: new FormControl<string | null>(document?.docDescription, [Validators.maxLength(500), Validators.pattern(this.alphaNumericSpace)]),
      docDate: new FormControl<Date | null>({ value: document?.docDate ? new Date(document.docDate) : new Date(), disabled: true }),
      docId: new FormControl<string | null>(document?.documentId, [Validators.required]),
    });
    const addOrRemoveValidation = (docTypeId) => {
      if (!docTypeId && docTypeId != 0) return;
      const docTypeFreeText = this.documentForm.get('docTypeFreeText') as FormControl;
      if (0 == docTypeId) {
        if (!docTypeFreeText.hasValidator(Validators.required)) {
          docTypeFreeText.addValidators(Validators.required);
        }
      } else {
        if (docTypeFreeText.hasValidator(Validators.required)) {
          docTypeFreeText.removeValidators(Validators.required);
        }
      }
    }
    this.documentForm.get('docTypeId')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => addOrRemoveValidation(value));
    addOrRemoveValidation(this.documentForm.get('docTypeId').value);
  }

  onCompleteDocumentUpload($event: any) {
    console.log($event);
    this.documentForm.get('docTitle')?.setValue($event.docTitle);
  }

  save() {
    if (this.documentForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.documentForm);
      return;
    }
    const documentData = this.documentForm.value;
    documentData.docDate = this.documentForm.get('docDate').value;
    documentData.moduleId = this.moduleId;
    documentData.subModuleId = this.subModuleId;
    documentData.patientId = this.patientId();
    documentData.appointmentId = this.appointmentId();

    const apiCall = this.getDocumentId ?
      this.documentService.updateDocument(documentData, this.getDocumentId) :
      this.documentService.saveDocument(documentData);

    this.isCallInitiated = true;
    apiCall.subscribe({
      next: (resp: any) => {
        this.isCallInitiated = false;
        this.onDocumentUpdate.emit(documentData);
        this.isVisible.set(false);
      },
      error: (err: any) => {
        this.isCallInitiated = false;
      }
    })
  }


}
