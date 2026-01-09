import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, effect, forwardRef, inject, input, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { DocumentResponse, DocumentUpload, DocumentUploadResponse } from '@interface/document.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '@service/document.service';
import { NotificationService } from '@service/notification.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadModule,
    InputGroupModule,
    InputTextModule,
    InputGroupAddonModule,
    ConfirmDialogModule,
    TranslateModule,
    ButtonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    },
    ConfirmationService
  ],

})
export class FileUploadComponent implements ControlValueAccessor {

  value = '';
  fileName = '';
  isViewModelVisible = false;

  readonly fileTypeSupported = input<string>('*');
  readonly moduleId = input.required<number>();
  readonly subModuleId = input.required<number>();
  readonly objectId = input.required<string>();
  readonly source = input.required<string>();
  readonly fileSize = input<number>(10);
  readonly isView = input<boolean>(false);
  readonly isDelete = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly multiple = input<boolean>(false);
  private readonly document = inject(DOCUMENT);

  readonly fileStored = output<string | null>();
  readonly completeDocumentUpload = output<DocumentUploadResponse>();

  readonly currentUploadId = `app-upload-${uuidv4()}`;

  onChange: (value: string) => void = () => {
    // no Implementation
  };
  onTouched: () => void = () => {
    // Mark the component as touched for Angular forms
  };



  get fileSizeInBytes(): number {
    return (this.fileSize()) * 1000000;
  }

  private readonly documentService = inject(DocumentService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    effect(() => {
      if (this.objectId()) {
        this.getCurrentDocument();
      }
    });
  }

  getCurrentDocument(): void {
    const params = new HttpParams().append('objectId', this.objectId()).append('moduleId', this.moduleId()).append('subModuleId', this.subModuleId());
    this.documentService.getDocumentByMapping<DocumentResponse>(params).subscribe((data: DocumentResponse) => {
      if (data) {
        this.value = data.documentId;
        this.fileName = data.docName;
      }
    })
  }

  openFileSelector(): void {
    const tmp = document.getElementById(this.currentUploadId)?.getElementsByClassName('p-fileupload-choose-button')
    if (tmp && tmp.length > 0) {
      (tmp[0] as HTMLElement).click()
    }
  }

  onFileSelect(event: FileSelectEvent): void {
    const file = event.files[0];
    if (file && !this.validateFile(file)) {
      this.clearFile();
      return;
    }

    const formData = new FormData();
    formData.append('file', file as Blob);
    const json: DocumentUpload = {
      moduleId: this.moduleId(),
      subModuleId: this.subModuleId(),
      source: this.source(),
      objectId: this.objectId()
    }
    formData.append('dataObject', JSON.stringify(json));

    this.documentService.uploadDocument<DocumentUploadResponse>(formData).subscribe({
      next: (data: DocumentUploadResponse) => {
        if (data) {
          this.value = data.documentId;
          this.fileName = data.docName;
          this.onChange(this.value);
          this.fileStored.emit(this.value);
          this.completeDocumentUpload.emit(data);
        }
      },
      error: (err: unknown) => {
        console.error('Upload failed:', err);
        this.clearFile();
      }
    });
  }

  deleteDocument(): void {
    const deleteFile = () => {
      const apiCall = this.documentService.deleteDocument(this.value);
      apiCall.subscribe(() => {
        this.clearFile();
        this.onChange(null);
        this.fileStored.emit(null);
        this.handleDrawerOverflow();
      })

    }

    const rejectConfirmation = () => {
      this.handleDrawerOverflow();
    };

    this.confirmationService.confirm({
      message: `Are you sure you want to delete this document?`,
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      key: 'document-delete',
      rejectButtonStyleClass: 'p-button-text',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        text: true,
      },
      acceptButtonProps: {
        label: 'Ok',
        text: true,
      },
      accept: deleteFile,
      reject: rejectConfirmation
    });

  }

  private validateFile(file: File): boolean {
    if (file.size > this.fileSizeInBytes) {
      const fileSize = this.fileSizeInBytes;
      this.notificationService.showWarning(`The uploaded image exceeds the allowed file size ${fileSize / 1000000}MB limit`);
      return false;
    }

    const fileTypeSupported = this.fileTypeSupported();
    if (fileTypeSupported !== '*') {
      const typeList = fileTypeSupported.split(",");
      let flag = true;
      const fileType = file.type.split("/")[1] ?? '';
      typeList.forEach((type) => {
        const regex = new RegExp(type.replace('.', ''));
        if (regex.exec(fileType)) {
          flag = false;
        }
      })
      if (flag) {
        this.notificationService.showWarning('Invalid file type')
        return false;
      }
    }

    return true;
  }

  clearFile(): void {
    this.fileName = '';
    this.value = '';
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  openViewModal(): void {
    if (!this.value) return;
    this.documentService.viewDocument(this.value);
  }

  /**
 * Fix for PrimeNG v19: Prevents the background from becoming scrollable 
 * when a nested overlay (e.g., OverlayPanel) closes while a Drawer is still active.
 */
  handleDrawerOverflow(): void {
    const drawerSelectors = ['p-drawer', '.p-drawer-mask', '.p-drawer-active'];

    // Check if any drawer element exists in the DOM
    const isDrawerActive = drawerSelectors.some(selector =>
      this.document.querySelector(selector)

    );
    if (isDrawerActive) {
      // Using a very short delay ensures we run 
      // after PrimeNG's internal 'onHide' cleanup logic.
      setTimeout(() => {
        this.document.body.classList.add('p-overflow-hidden');
      }, 200);
    }
  }

}