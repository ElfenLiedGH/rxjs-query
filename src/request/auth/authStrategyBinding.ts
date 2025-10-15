import { BindingKey } from '../../di/binding';
import { TokenAuthStrategy } from './tokenAuthStrategy';
import type { AuthStrategy } from './types';

const AUTH_STRATEGY_TOKEN = Symbol('AUTH_STRATEGY');
export const authStrategyBinding = new BindingKey<AuthStrategy>(
  AUTH_STRATEGY_TOKEN,
  TokenAuthStrategy
);
