import { BindingKey } from '@smwb/di';
import type { AuthStrategy } from '../types/strategies/auth.strategy';

const AUTH_STRATEGY_TOKEN = Symbol('AUTH_STRATEGY');
export const authStrategyBinding = new BindingKey<AuthStrategy>(
  AUTH_STRATEGY_TOKEN
);

const AUTH_STRATEGY_GET_AUTH_TOKEN = Symbol('AUTH_STRATEGY_GET_AUTH_TOKEN');
export const authStrategyGetAuthTokenBinding = new BindingKey<
  () => string | null
>(AUTH_STRATEGY_GET_AUTH_TOKEN);

const AUTH_STRATEGY_SET_AUTH_TOKEN = Symbol('AUTH_STRATEGY_SET_AUTH_TOKEN');
export const authStrategySetAuthTokenBinding = new BindingKey<
  (v: string) => void
>(AUTH_STRATEGY_SET_AUTH_TOKEN);
