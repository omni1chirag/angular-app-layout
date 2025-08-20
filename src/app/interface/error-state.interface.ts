export interface ErrorState {
    code?: string;
    severity?: string;
    summary?: string;
    path?: string;
    status?: number;
    detail?: any;
  }