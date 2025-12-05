import { Subject, ReplaySubject } from 'rxjs';
import { Inject, Injectable, Logger } from '@smwb/di';
import { httpRequestServiceBinding } from '../../bindings';
import { cacheServiceBinding } from '../../bindings/cacheService.bindings';
import { observableRequestServiceBaseUrlBinding } from '../../bindings/observableRequestService.bindings';
import { completedProgressState, inProgressState, METHODS } from './const';
import { getQueryUrl } from './utils';
import type {
  CacheService,
  ErrorData,
  RequestState,
} from '../../types/services/cache.service';
import type {
  ApiRequestOptions,
  HTTPRequestService,
} from '../../types/services/HTTPRequest.service';
import type {
  CreateObservableRequestResponse,
  ExecutionOptions,
  ObservableRequestService,
  QueryParams,
} from '../../types/services/observableRequest.service';

@Injectable()
export class RxJsRequest<E = ErrorData> implements ObservableRequestService<E> {
  private readonly logger = Logger.log;
  private readonly baseUrl: string;

  private readonly apiRequest: HTTPRequestService;
  private readonly requestCache: CacheService<E>;
  private readonly requestSubjects = new Map<
    string,
    Subject<RequestState<unknown, unknown>>
  >();
  private readonly pendingRequests = new Set<string>();

  constructor(
    @Inject(httpRequestServiceBinding) apiRequest: HTTPRequestService,
    @Inject(cacheServiceBinding) requestCache: CacheService<E>,
    @Inject(observableRequestServiceBaseUrlBinding) baseUrl: string
  ) {
    this.apiRequest = apiRequest;
    this.requestCache = requestCache;
    this.baseUrl = baseUrl;
  }

  private getRequestKey(method: string, queryUrl: string): string {
    return `${method}/${queryUrl}`;
  }

  private getOrCreateSubject<T, E>(
    requestKey: string
  ): {
    subject: ReplaySubject<RequestState<T, E>>;
    isNew: boolean;
  } {
    let isNew = false;
    let subject = this.requestSubjects.get(requestKey);
    if (!subject) {
      isNew = true;
      subject = new ReplaySubject();
      this.requestSubjects.set(requestKey, subject);
    }
    return { subject: subject as ReplaySubject<RequestState<T, E>>, isNew };
  }

  // TODO path параметры
  // TODO загрузка файлов
  public createApiRequest<T, P extends Record<string, string> = never>(
    query: string | QueryParams<P>,
    options: ApiRequestOptions = {},
    executionOptions: ExecutionOptions = {}
  ): CreateObservableRequestResponse<T, E> {
    const { ignoreCache = false, cacheTtl, ...fetchOptions } = options;
    const { lazy = false } = executionOptions;
    const url = `${this.baseUrl}${getQueryUrl<P>(query)}`;
    const requestKey = this.getRequestKey(
      fetchOptions.method ?? METHODS.GET,
      url
    );
    this.logger('createApiRequest', {
      url,
      requestKey,
      ignoreCache,
      lazy,
    });
    const { subject, isNew } = this.getOrCreateSubject<T, E>(requestKey);
    if (isNew) {
      this.requestCache.subscribe(requestKey, subject);
    }

    const refetch = () =>
      this.createApiRequest(query, { ...options, ignoreCache: true });

    const execute = () => {
      // If already pending or cached and not ignoring cache, don't execute again
      if (
        (!ignoreCache && this.requestCache.has(requestKey)) ||
        this.pendingRequests.has(requestKey)
      ) {
        return;
      }
      this.pendingRequests.add(requestKey);
      this.requestCache.merge(requestKey, inProgressState, cacheTtl);
      this.apiRequest
        .call<T>(url, fetchOptions)
        .then((res) => {
          this.logger('createApiRequest resolve', {
            url,
            requestKey,
            ignoreCache,
            res,
          });
          this.requestCache.set<T>(
            requestKey,
            {
              data: res,
              ...completedProgressState,
            },
            cacheTtl
          );
        })
        .catch((err: unknown) => {
          this.logger('createApiRequest error', {
            url,
            requestKey,
            ignoreCache,
            err,
          });
          this.requestCache.merge(
            requestKey,
            {
              error: err as E,
              ...completedProgressState,
            },
            cacheTtl
          );
        })
        .finally(() => {
          this.pendingRequests.delete(requestKey);
        });
    };

    // If lazy is true, don't execute immediately, just return the execute function
    if (lazy) {
      return { refetch, subject, execute };
    }

    // If not lazy, execute immediately
    if (
      (!ignoreCache && this.requestCache.has(requestKey)) ||
      this.pendingRequests.has(requestKey)
    ) {
      return { refetch, subject };
    }
    execute();
    return { refetch, subject };
  }
}
