export interface TermsAndCondition {
    id: number;
    groupType: string;
    module: string;
    code: string;
    version: number;
    title: string;
    label: string;
    content: string;
    active: boolean;
    mandatory: boolean;
    effectiveDate: Date;
    expiryDate: Date;
    sanitizeContent: string;
}

export interface TermsStatusResponse {

    termsId: number;
    groupType: string;
    module: string;
    code: string;
    content: string;

    currentVersion: number;
    acceptedVersion: number;
    accepted: boolean;
    mandatory: boolean;

}

export interface TermsConent {
    termsId: number;
    content: string;
}

export interface TermsContentDTO {
  termsId: number;
  content: string;
}

export type GroupType = 'USER' | 'PATIENT' | 'ORGANIZATION';

export interface AcceptTermsRequestDTO {
  groupType: GroupType;
  entityId: string;
  terms: TermsContentDTO[];
}