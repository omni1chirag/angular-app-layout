export interface DocumentUpload {
    source: string;
    moduleId: number;
    subModuleId: number;
    objectId: string;
}

export interface DocumentResponse {
    documentId: string;
    docTitle: string;
    docTypeId: number;
    docTypeFreeText: string;
    docDescription: string;
    docDate: Date;
    patientId: string;
    appointmentId: string;
}

export interface DocumentUploadResponse {
    documentId: string;
    docTitle: string;
    docName: string;
}

export interface CreateDocument {
    docTitle: string;
    docTypeId: number;
    docTypeFreeText: string;
    docDescription: string;
    docDate: Date;
    docId: string;
    moduleId: number;
    subModuleId: number;
    patientId: string;
    appointmentId: string;
}
export interface UpdateDocument {
    docTitle: string;
    docTypeId: number;
    docTypeFreeText: string;
    docDescription: string;
    docDate: Date;
}

export interface DocumentResponse {
    documentId: string;
    docTitle: string;
    docExtension: string;
    docName: string;
}

export interface DocumentListResponse {
    documentId: string;
    docTitle: string;
    docType: number;
    docTypeName: string;
    docDate: Date;
    lastUpdatedDate: Date;
    isEditable: boolean;
    uploadById: string;
    uploadBy: string;
    appointmentId: string;
    appointmentSignOff: number;
}

