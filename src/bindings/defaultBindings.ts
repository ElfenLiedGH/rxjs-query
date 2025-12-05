import { container } from '@smwb/di';

import { ApiRequest } from '../implementations/apiRequest/apiRequest';
import { CacheController } from '../implementations/cacheController/cacheController';
import { RxJsRequest } from '../implementations/rxJsRequest/rxJsRequest';
import { deepObjectCompare } from '../utils';
import {
  authStrategyGetAuthTokenBinding,
  authStrategySetAuthTokenBinding,
} from './authStrategy.bindings';
import {
  cacheServiceBinding,
  cacheServiceDefaultTtlBinding,
} from './cacheService.bindings';
import { fetchServiceBinding } from './fetchService.bindings';
import { httpRequestServiceBinding } from './httpRequestService.bindings';
import { observableRequestServiceBinding } from './observableRequestService.bindings';
import { deepComparatorBinding } from './utils.bindings';

// auth
const authStore = 'authToken';
container
  .bind(authStrategyGetAuthTokenBinding)
  .toFunction(() => localStorage.getItem(authStore));
container.bind(authStrategySetAuthTokenBinding).toFunction((v: string) => {
  localStorage.setItem(authStore, v);
});

// fetch
container.bind(fetchServiceBinding).toFunction(fetch);
container.bind(httpRequestServiceBinding).toClass(ApiRequest);

// cache
export const CACHE_DEFAULT_TTL = 5 * 60 * 1000;
container.bind(cacheServiceDefaultTtlBinding).toConstant(CACHE_DEFAULT_TTL);
container.bind(cacheServiceBinding).toClass(CacheController);
container.bind(deepComparatorBinding).toFunction(deepObjectCompare);

// observable
container.bind(observableRequestServiceBinding).toClass(RxJsRequest);
