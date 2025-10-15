import { filter, map, type Observer, Subject } from 'rxjs';
import { Inject, Injectable } from '../../di';
import { inProgressState } from '../const';
import { deepObjectCompare } from '../utils';
import {
  compareDataOnSetBinding,
  deepComparatorTokenBinding,
  defaultCacheTtlBinding,
} from './binding';
import type { CachedResponse, ErrorData, RequestState } from '../types';

@Injectable()
export class CacheController<E = ErrorData> {
  private readonly deepComparator: (a: unknown, b: unknown) => boolean;
  private readonly compareDataOnSet: boolean;
  private readonly defaultCacheTtl: number;

  private s = new Subject<{
    requestKey: string;
    value: RequestState<unknown, E>;
  }>();
  private readonly requestCache = new Map<
    string,
    CachedResponse<unknown, unknown>
  >();

  constructor(
    @Inject(compareDataOnSetBinding) compareDataOnSet: boolean,
    @Inject(deepComparatorTokenBinding)
    deepComparator: typeof deepObjectCompare,
    @Inject(defaultCacheTtlBinding) defaultCacheTtl: number
  ) {
    this.defaultCacheTtl = defaultCacheTtl;
    this.compareDataOnSet = compareDataOnSet;
    this.deepComparator = deepComparator;
  }

  public subscribe<T>(
    requestKey: string,
    observerOrNext?:
      | Partial<Observer<RequestState<T, E>>>
      | ((value: RequestState<T, E>) => void)
  ) {
    return this.s
      .pipe(
        filter((value) => value.requestKey === requestKey),
        map((value) => value.value),
        filter((value): value is RequestState<T, E> => !!value)
      )
      .subscribe(observerOrNext);
  }

  public set<T>(
    requestKey: string,
    data: RequestState<T, E>,
    expiry = this.defaultCacheTtl
  ) {
    let oldData: T | undefined;
    let flagsIsEqual = false;
    if (this.compareDataOnSet) {
      const cache = this.get(requestKey);
      if (cache) {
        const d = cache.data;
        oldData = this.deepComparator(d, data.data) ? (d as T) : undefined;
        flagsIsEqual =
          cache.error === data.error &&
          cache.loading === data.loading &&
          cache.called === data.called &&
          cache.completed === data.completed;
      }
    }

    const dataForSet: RequestState<T, E> = oldData
      ? {
          data: oldData,
          error: data.error,
          loading: data.loading,
          called: data.called,
          completed: data.completed,
        }
      : data;

    this.requestCache.set(requestKey, {
      data: dataForSet,
      expiry: Date.now() + expiry,
    });

    if (this.compareDataOnSet && !!oldData && flagsIsEqual) {
      return;
    }

    this.s.next({
      requestKey,
      value: dataForSet,
    });
  }

  public merge<T>(
    requestKey: string,
    data: Partial<RequestState<T, E>>,
    cacheTtl = this.defaultCacheTtl
  ) {
    const cache = this.get(requestKey) ?? {
      data: undefined,
      error: undefined,
      ...inProgressState,
    };
    this.set(
      requestKey,
      {
        ...cache,
        ...data,
      },
      cacheTtl
    );
  }

  public has(requestKey: string): boolean {
    return !!this.requestCache.get(requestKey);
  }

  public get<T>(requestKey: string): RequestState<T, E> | undefined {
    const cached = this.requestCache.get(requestKey);
    const now = Date.now();

    if (cached && cached.expiry > now) {
      return cached.data as RequestState<T, E>;
    }

    if (cached && cached.expiry <= now) {
      this.requestCache.delete(requestKey);
    }
  }
}
