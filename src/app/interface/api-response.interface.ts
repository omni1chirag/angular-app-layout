export interface ApiResponse<T> {
    message: string;
    data: T;
    status: string;
    localizedKey: string;
}

export interface PaginationResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    lastPage: boolean;
    pageElements: number;
}