import { BindingKey } from '../../di/binding';
import { DEFAULT_CACHE_TTL } from '../const';
import { deepObjectCompare } from '../utils';

const DEFAULT_CACHE_TTL_TOKEN = Symbol('DEFAULT_CACHE_TTL');
export const defaultCacheTtlBinding = new BindingKey<number>(
  DEFAULT_CACHE_TTL_TOKEN,
  DEFAULT_CACHE_TTL
);

const COMPARE_DATA_ON_SET_TOKEN = Symbol('COMPARE_DATA_ON_SET');
export const compareDataOnSetBinding = new BindingKey<boolean>(
  COMPARE_DATA_ON_SET_TOKEN,
  true
);

const DEEP_COMPARATOR_TOKEN = Symbol('DEEP_COMPARATOR');
export const deepComparatorTokenBinding = new BindingKey<
  typeof deepObjectCompare
>(DEEP_COMPARATOR_TOKEN, deepObjectCompare);
