import { BindingKey } from '../../di/binding';
import { CacheController } from './cacheController';

const CACHE_CONTROLLER_TOKEN = Symbol('CACHE_CONTROLLER');
export const cacheControllerBinding = new BindingKey<CacheController>(
  CACHE_CONTROLLER_TOKEN,
  CacheController
);
