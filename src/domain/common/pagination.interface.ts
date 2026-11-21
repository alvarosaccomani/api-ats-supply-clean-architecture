export interface PaginationParams {
    page: number;
    perPage: number;
}

export interface PaginationMeta {
    page: number;
    perPage: number;
    item: number;
    itemOf: number;
    numElements: number;
    totalPages: number;
    prePage: number | null;
    nextPage: number | null;
    total?: number;
}

export interface PaginatedResult<T> extends PaginationMeta {
    success: boolean;
    message: string;
    data: T[];
}

export interface QueryOptions {
    transaction?: any;
    page?: number;
    perPage?: number;
    limit?: number;
    offset?: number;
    order?: any;
    where?: any;
}
