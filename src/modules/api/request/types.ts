export interface CachedResponse<T, E> {
    data: RequestState<T, E>;
    expiry: number;
}

export interface ErrorData {
    message: string;
}

export interface ApiRequestOptions extends RequestInit {
    cacheTtl?: number;
    ignoreCache?: boolean;
    timeout?: number;
    tryRefreshToken?: boolean;
}

export interface RequestState<T, E = ErrorData> {
    data?: T;
    error?: E;
    loading: boolean;
    called: boolean;
    completed: boolean;
}

export interface QueryParams<P> {
    url: string,
    searchParams?: P,
}