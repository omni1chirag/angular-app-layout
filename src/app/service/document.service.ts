import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PlatformService } from './platform.service';
import { CreateDocument, UpdateDocument } from '@interface/document.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private ref: DynamicDialogRef | undefined;

  private readonly allowedProtocols = new Set(['https:', 'blob:']);
  private readonly apiUrls = {
    getDocument: 'document-api/documents',
  }

  private readonly dialogService = inject(DialogService);
  private readonly apiService = inject(ApiService);
  private readonly platformService = inject(PlatformService);

  toTrustedResourceUrl(raw: string): string {
    const allowedOrigins = new Set([window?.location?.origin]);

    const u = this.platformService.isBrowser() ? new URL(raw, window.location.origin) : new URL(raw);
    if (!this.allowedProtocols.has(u.protocol)) throw new Error('Disallowed protocol');
    if (!allowedOrigins.has(u.origin)) throw new Error('Untrusted origin');
    if (u.hash && /javascript|data|vbscript/i.test(u.hash)) throw new Error('Suspicious hash component');
    return u.toString();
  }

  viewDocument(documentId: string): void {
    if (!documentId) return;
    this.getFile<Blob>(documentId).subscribe((blob: Blob) => {
      const isImage = blob.type.startsWith('image/');
      const url = URL.createObjectURL(blob);
      if (isImage) {
        import('@component/common/document-viewer/document-viewer.component').then(component => {
          this.ref = this.dialogService.open(component.DocumentViewerComponent, {
            width: '95vw',
            height: '95vh',
            modal: !this.isDrawerActive(),
            inputValues: {
              url: url,
              documentId: documentId,
              title: 'Document'
            }
          })
          this.ref.onClose.subscribe(() => {
            URL.revokeObjectURL(url);
          });
        }
        );
      } else {
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.location.href = url;
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 100);
        }
      }
    })
  }

  uploadDocument<T>(formData: FormData): Observable<T> {
    return this.apiService.post(`${this.apiUrls.getDocument}/upload`, formData);
  }

  saveDocument<T>(data: CreateDocument): Observable<T> {
    return this.apiService.post(`${this.apiUrls.getDocument}`, data);
  }

  updateDocument<T>(data: UpdateDocument, documentId: string): Observable<T> {
    return this.apiService.put(`${this.apiUrls.getDocument}/${documentId}`, data);
  }

  getDocuments<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(this.apiUrls.getDocument, { params });
  }

  getDocument<T>(documentId: string): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getDocument}/${documentId}`);
  }

  searchDocuments<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getDocument}/search`, { params });
  }
  getDocumentByMapping<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getDocument}/by-mapping`, { params });
  }

  deleteDocument<T>(documentId: string): Observable<T> {
    return this.apiService.delete(`${this.apiUrls.getDocument}/${documentId}`);
  }

  deleteDocumentByMapping<T>(moduleId: number, subModuleId: number, objectId: string): Observable<T> {
    return this.apiService.delete(`${this.apiUrls.getDocument}/module/${moduleId}/sub-module/${subModuleId}/object/${objectId}`);
  }

  getFile<T>(documentId: string): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getDocument}/${documentId}/file`, { responseType: 'blob' });
  }

  getThumbnail<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getDocument}/thumbnail`, { params, responseType: 'blob' });
  }

  getDocumentsByIds<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getDocument}/by-ids`, { params });
  }

  getDocumentsByPatientAndAppointment<T>(params: HttpParams): Observable<T> {
    return this.apiService.get<T>(`${this.apiUrls.getDocument}/by-patient-appointment`, { params });
  }

  // Check for the drawer element or the drawer mask
  private isDrawerActive(): boolean {
    return !!document.querySelector('p-drawer') ||
      !!document.querySelector('.p-drawer-mask') ||
      !!document.querySelector('.p-drawer-active');
  }
}
