import type { Observer } from 'rxjs';

export interface CachedResponse<T, E> {
  data: RequestState<T, E>;
  expiry: number;
}

export interface ErrorData {
  message: string;
}

// TODO кешу не надо знать внутреннюю структуру
export interface RequestState<T, E = ErrorData> {
  data?: T;
  error?: E;
  loading: boolean;
  called: boolean;
  completed: boolean;
}

export interface CacheService<E = ErrorData> {
  subscribe<T>(
    requestKey: string,
    observerOrNext?: // TODO вместо RXJS написать свой тип, что бы сервис был независимым
    | Partial<Observer<RequestState<T, E>>>
      | ((value: RequestState<T, E>) => void)
  ): { unsubscribe: () => void };

  set<T>(requestKey: string, data: RequestState<T, E>, expiry?: number): void;

  merge<T>(
    requestKey: string,
    data: Partial<RequestState<T, E>>,
    cacheTtl?: number
  ): void;

  has(requestKey: string): boolean;

  get<T>(requestKey: string): RequestState<T, E> | undefined;
}
