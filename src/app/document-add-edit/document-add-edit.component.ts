import { CommonModule } from '@angular/common';
import { Component, inject, input, model, OnDestroy, OnInit, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { REGEX } from '@constants/regex.constant';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { LabelValue } from '@interface/common.interface';
import { DocumentResponse, DocumentUploadResponse } from '@interface/document.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '@service/document.service';
import { MasterService } from '@service/master.service';
import { PlatformService } from '@service/platform.service';
import { UtilityService } from '@service/utility.service';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-document-add-edit',
  imports: [TranslateModule,
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
    CommonModule],
  templateUrl: './document-add-edit.component.html',
})
export class DocumentAddEditComponent implements OnInit, OnDestroy {

  isVisible = model<boolean>(false);

  readonly documentId = input.required<string | null>();
  readonly appointmentId = input.required<string>();
  readonly patientId = input.required<string>();

  private readonly _fb = inject(FormBuilder);
  private readonly utilityService = inject(UtilityService);
  private readonly documentService = inject(DocumentService);
  private readonly platformService = inject(PlatformService);
  private readonly masterService = inject(MasterService);

  isCallInitiated = false;
  documentForm!: FormGroup;
  alphaNumericSpace: RegExp = REGEX.ALPHA_NUMERIC_SPACE;
  documentTypes: LabelValue<number>[] = [];
  supportedTypes = ".jpeg,.png,.jpg,.pdf";
  isBrowser = false;
  moduleId = 1;
  subModuleId = 1;
  formSubscription$ = new Subject<void>();
  mode: 'ADD_DOCUMENT' | 'EDIT_DOCUMENT' = 'ADD_DOCUMENT';

  documentUpdate = output<string>();

  get getDocumentId(): string {
    return this.documentForm.get('documentId')?.value;
  }

  get isDocumentTypeFreeText(): boolean {
    return 0 == this.documentForm?.get('docTypeId')?.value;
  }


  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
    const docId = this.documentId();
    if (docId !== null) {
      this.getDocument(docId);
    } else {
      this.initializeForm();
    }
  }

  ngOnDestroy(): void {
    this.formSubscription$.next();
    this.formSubscription$.complete();
  }

  getDocument(documentId: string): void {
    this.mode = 'EDIT_DOCUMENT';
    this.documentService.getDocument<DocumentResponse>(documentId).subscribe({
      next: (data) => {
        this.initializeForm(data);
      },
      error: () => {
        this.isVisible.set(false);
      }
    })
  }

  initializeMasterData(): void {
    this.masterService.getDocumentTypes<LabelValue<number>[]>().subscribe((data: LabelValue<number>[] = []) => {
      this.documentTypes = data;
    });
  }

  initializeForm(document: DocumentResponse = {} as DocumentResponse): void {
    this.documentForm = this._fb.group({
      documentId: new FormControl<string>({ value: document?.documentId, disabled: true }),
      docTitle: new FormControl<string>(document?.docTitle, [Validators.required, Validators.maxLength(100)]),
      docTypeId: new FormControl<number>(document?.docTypeId, [Validators.required]),
      docTypeFreeText: new FormControl<string>(document?.docTypeFreeText),
      docDescription: new FormControl<string>(document?.docDescription, [Validators.maxLength(500), Validators.pattern(this.alphaNumericSpace)]),
      docDate: new FormControl<Date>({ value: document?.docDate ? new Date(document.docDate) : new Date(), disabled: true }),
      docId: new FormControl<string>(document?.documentId, [Validators.required]),
    });
    const addOrRemoveValidation = (docTypeId: number) => {
      if (!docTypeId && docTypeId != 0) return;
      const docTypeFreeText = this.documentForm.get('docTypeFreeText') as FormControl;
      if (0 == docTypeId) {
        if (!docTypeFreeText.hasValidator(Validators.required)) {
          docTypeFreeText.addValidators(Validators.required);
        }
      } else if (docTypeFreeText.hasValidator(Validators.required)) {
        docTypeFreeText.removeValidators(Validators.required);
      }
    }
    this.documentForm.get('docTypeId')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => addOrRemoveValidation(value));
    addOrRemoveValidation(this.documentForm.get('docTypeId')?.value);
  }

  onCompleteDocumentUpload($event: DocumentUploadResponse): void {
    this.documentForm.get('docTitle')?.setValue($event.docTitle);
  }

  save(): void {
    if (this.documentForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.documentForm);
      return;
    }
    const documentData = this.documentForm.value;
    documentData.docDate = this.documentForm.get('docDate')?.value;
    documentData.moduleId = this.moduleId;
    documentData.subModuleId = this.subModuleId;
    documentData.patientId = this.patientId();
    documentData.appointmentId = this.appointmentId();

    const apiCall = this.getDocumentId ?
      this.documentService.updateDocument<string>(documentData, this.getDocumentId) :
      this.documentService.saveDocument<string>(documentData);

    this.isCallInitiated = true;
    apiCall.subscribe({
      next: (data) => {
        this.isCallInitiated = false;
        this.documentUpdate.emit(data);
        this.isVisible.set(false);
      },
      error: () => {
        this.isCallInitiated = false;
      }
    })
  }

}
