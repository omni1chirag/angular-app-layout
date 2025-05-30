import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, effect, EventEmitter, forwardRef, input, Output, output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentService } from '@service/document.service';
import { NotificationService } from '@service/notification.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

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

  value: any = '';

  readonly fileTypeSupported = input<string>('*');
  readonly moduleId = input<number | string>(undefined);
  readonly subModuleId = input<number | string>(undefined);
  readonly objectId = input.required<string>();
  readonly source = input.required<string>();
  readonly fileSize = input<number>(10);
  readonly isView = input<Boolean>(false);
  readonly isDelete = input<Boolean>(false);
  readonly disabled = input<Boolean>(false);
  readonly fileStored = output<any>();
  readonly multiple = input<Boolean>(false);

  @Output() completeDocumentUpload = new EventEmitter<any>();

  currentUploadId = 'app-upload' + Math.floor(Math.random() * 150000);
  isViewModelVisible = false;
  fileName = '';
  onChange: any = () => { };
  onTouched: any = () => { };

  get fileSizeInBytes(): number {
    return (this.fileSize()) * 1000000;
  }

  constructor(private documentService: DocumentService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {
    effect(() => {
      if (this.objectId()) {
        this.getCurrentDocument();
      }
    });
  }

  getCurrentDocument() {
    let params = new HttpParams().append('objectId', this.objectId()).append('moduleId', this.moduleId()).append('subModuleId', this.subModuleId());
    this.documentService.getDocumentByMapping(params).subscribe((resp: any) => {
      if (resp.data) {
        this.value = resp.data.documentId;
        this.fileName = resp.data.docName;
      }
    })
  }

  openFileSelector() {
    const tmp = document.getElementById(this.currentUploadId).getElementsByClassName('p-fileupload-choose-button')
    if (tmp && tmp.length > 0) {
      (<HTMLElement>tmp[0]).click()
    }
  }

  onFileSelect(event: any) {
    const file = event.files[0];
    if (!this.validateFile(file)) {
      this.clearFile();
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    const json = {
      'moduleId': this.moduleId(),
      'subModuleId': this.subModuleId(),
      'source': this.source()
    }
    formData.append('dataObject', JSON.stringify(json));

    this.documentService.uploadDocument(formData).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.value = response.data.documentId;
          this.fileName = response.data.docName;
          this.onChange(this.value);
          this.fileStored.emit(this.value);
          this.completeDocumentUpload.emit(response.data);
        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.clearFile();
      }
    });
  }

  deleteDocument() {
    const deleteFile = () => {
      this.documentService.deleteDocument(this.value).subscribe((resp: any) => {
        this.notificationService.showSuccess(resp.message)
        this.clearFile();
        this.onChange(null);
        this.fileStored.emit(null);
      })
    }
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
      const fileType = file.type.split("/")[1];
      typeList.forEach((type) => {
        if (fileType.match(new RegExp(type.replace('.', '')))) {
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

  clearFile() {
    this.fileName = '';
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }

  openViewModal() {
    if (!this.value) return;
    this.documentService.viewDocument(this.value);
  }

}