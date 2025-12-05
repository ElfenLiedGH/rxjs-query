import type { ErrorData, RequestState } from './cache.service';
import type { ApiRequestOptions } from './HTTPRequest.service';
import type { ReplaySubject } from 'rxjs';

export interface QueryParams<P> {
  url: string;
  searchParams?: P;
}

export interface ExecutionOptions {
  /**
   * If true, the request will not be executed immediately.
   * Instead, an execute function will be returned to trigger the request manually.
   */
  lazy?: boolean;
}

export interface CreateObservableRequestResponse<T, E = ErrorData> {
  subject: ReplaySubject<RequestState<T, E>>;
  refetch: () => void;
  execute?: () => void;
}

export interface ObservableRequestService<E = ErrorData> {
  createApiRequest<T, P extends Record<string, string> = never>(
    query: string | QueryParams<P>,
    options?: ApiRequestOptions,
    executionOptions?: ExecutionOptions
  ): CreateObservableRequestResponse<T, E>;
}
