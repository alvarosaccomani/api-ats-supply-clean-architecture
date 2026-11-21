export interface SingleResult<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiErrorResult {
    success: false;
    message: string;
    error?: string;
}
