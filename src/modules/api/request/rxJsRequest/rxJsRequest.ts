import {Subject, ReplaySubject} from 'rxjs';
import type {
    ApiRequestOptions,
    ErrorData,
    QueryParams,
    RequestState
} from "../types.ts";
import {completedProgressState, inProgressState, METHODS} from "../const";
import {getQueryUrl} from "../utils";
import {CacheController, cacheControllerBinding} from "../cacheController";
import {ApiRequest} from "../apiRequest";
import {Inject, Injectable} from "../../../di";
import {rxjsBaseUrlBinding} from "./binding";
import {apiRequestBinding} from "../apiRequest/apiRequestBinding";

@Injectable()
export class RxJsRequest<E = ErrorData> {

    private readonly logger: (...data: any[]) => void = () => {
    };
    private readonly baseUrl: string;

    private readonly apiRequest: ApiRequest;
    private readonly requestCache: CacheController<E>;
    private readonly requestSubjects = new Map<string, Subject<RequestState<unknown, unknown>>>();
    private readonly pendingRequests = new Set<string>;

    constructor(
        @Inject(apiRequestBinding) apiRequest: ApiRequest,
        @Inject(cacheControllerBinding) requestCache: CacheController<E>,
        @Inject(rxjsBaseUrlBinding) baseUrl: string,
    ) {
        this.apiRequest = apiRequest;
        this.requestCache = requestCache;
        this.baseUrl = baseUrl;
    }

    private getRequestKey(method: string, queryUrl: string): string {
        return `${method}/${queryUrl}`;
    }

    private getOrCreateSubject<T, E>(requestKey: string): {
        subject: ReplaySubject<RequestState<T, E>>,
        isNew: boolean
    } {
        let isNew = false;
        let subject = this.requestSubjects.get(requestKey);
        if (!subject) {
            isNew = true;
            subject = new ReplaySubject() as ReplaySubject<RequestState<unknown, unknown>>;
            this.requestSubjects.set(requestKey, subject);
        }
        return {subject: subject as ReplaySubject<RequestState<T, E>>, isNew};
    }

    // TODO path параметры
    // TODO body параметры
    // TODO загрузка файлов
    public createApiRequest<T, P extends Record<string, string> = never>(
        query: string | QueryParams<P>,
        options: ApiRequestOptions = {}
    ): { subject: ReplaySubject<RequestState<T, E>>, refetch: () => void } {
        const {
            ignoreCache = false,
            cacheTtl,
            ...fetchOptions
        } = options;
        const url = `${this.baseUrl}${getQueryUrl<P>(query)}`
        // TODO body не забыть
        const requestKey = this.getRequestKey(fetchOptions.method || METHODS.GET, url);
        this.logger('createApiRequest', {
            url,
            requestKey,
            ignoreCache,
        })
        const {subject, isNew} = this.getOrCreateSubject<T, E>(requestKey);
        if (isNew) {
            this.requestCache.subscribe(requestKey, subject);
        }

        const refetch = () => this.createApiRequest(query, {...options, ignoreCache: true});

        if (!ignoreCache && this.requestCache.has(requestKey) || this.pendingRequests.has(requestKey)) {
            return {refetch, subject};
        }
        this.pendingRequests.add(requestKey)
        this.requestCache.merge(requestKey, inProgressState, cacheTtl);
        this.apiRequest.call<T>(url, fetchOptions)
            .then(res => {
                this.logger('createApiRequest resolve', {
                    url,
                    requestKey,
                    ignoreCache,
                    res,
                })
                this.requestCache.set<T>(requestKey, {
                    data: res,
                    ...completedProgressState
                }, cacheTtl);

            })
            .catch(err => {
                this.logger('createApiRequest error', {
                    url,
                    requestKey,
                    ignoreCache,
                    err,
                })
                this.requestCache.merge(requestKey, {
                    error: err as E,
                    ...completedProgressState
                }, cacheTtl)

            })
            .finally(() => {
                this.pendingRequests.delete(requestKey)
            })
        return {refetch, subject};
    }
}
