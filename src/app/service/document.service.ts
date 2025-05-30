import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private ref: DynamicDialogRef | undefined;

  private dialogService = inject(DialogService);
  private apiService = inject(ApiService);

  private apiUrls = {
    getDocument: 'document-api/documents',
  }

  viewDocument(documentId) {
    if (!documentId) return;
    this.getFile(documentId).subscribe(async (blob: Blob) => {
      const isImage = blob.type.startsWith('image/');
      const url = URL.createObjectURL(blob);
      if (isImage) {
        const component = await import('@component/common/document-viewer/document-viewer.component');
        this.ref = this.dialogService.open(component.DocumentViewerComponent, {
          width: '95vw',
          height:'95vh',
          modal: true,
          inputValues: {
            url: url,
            documentId: documentId,
            title:'Document'
          }
        })
        this.ref.onClose.subscribe(() => {
          URL.revokeObjectURL(url);
        });

        return;
      }
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.location.href = url;
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      }
    })
  }

  uploadDocument<T>(formData): Observable<T> {
    return this.apiService.post(`${this.apiUrls.getDocument}/upload`, formData);
  }

  saveDocument<T>(data): Observable<T> {
    return this.apiService.post(`${this.apiUrls.getDocument}`, data);
  }

  updateDocument(data: any, documentId: any) {
    return this.apiService.put(`${this.apiUrls.getDocument}/${documentId}`, data);
  }

  getDocuments<T>(params?): Observable<T> {
    return this.apiService.get(this.apiUrls.getDocument, { params });
  }

  getDocument<T>(documentId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.getDocument}/${documentId}`);
  }

  searchDocuments<T>(patientId: string, searchParams: any): Observable<T> {
    let params = new HttpParams().append('patient', patientId).append('name', searchParams);
    return this.apiService.get(`${this.apiUrls.getDocument}/search`, { params });
  }
  getDocumentByMapping<T>(params): Observable<T> {
    return this.apiService.get(`${this.apiUrls.getDocument}/by-mapping`, { params });
  }

  deleteDocument<T>(documentId): Observable<T> {
    return this.apiService.delete(`${this.apiUrls.getDocument}/${documentId}`);
  }

  getFile<T>(documentId): Observable<T> {
    return this.apiService.get(`${this.apiUrls.getDocument}/${documentId}/file`, { responseType: 'blob' });
  }

  getThumbnail<T>(params): Observable<T> {
    return this.apiService.get(`${this.apiUrls.getDocument}/thumbnail`, { params, responseType: 'blob' });
  }


}
