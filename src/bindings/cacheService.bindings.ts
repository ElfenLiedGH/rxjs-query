import { BindingKey } from '@smwb/di';
import type { CacheService } from '../types/services/cache.service';

const CACHE_SERVICE_DEFAULT_TTL_TOKEN = Symbol(
  'CACHE_SERVICE_DEFAULT_TTL_TOKEN'
);
export const cacheServiceDefaultTtlBinding = new BindingKey<number>(
  CACHE_SERVICE_DEFAULT_TTL_TOKEN
);

const CACHE_SERVICE_TOKEN = Symbol('CACHE_SERVICE_TOKEN');
export const cacheServiceBinding = new BindingKey<CacheService>(
  CACHE_SERVICE_TOKEN
);
