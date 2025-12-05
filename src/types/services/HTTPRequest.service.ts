export interface ApiRequestOptions extends RequestInit {
  cacheTtl?: number;
  ignoreCache?: boolean;
  timeout?: number;
  tryRefreshToken?: boolean;
}

export interface HTTPRequestService {
  call<T = unknown>(
    url: string,
    options?: Omit<ApiRequestOptions, 'cacheTtl' | 'ignoreCache'>
  ): Promise<T>;
}
