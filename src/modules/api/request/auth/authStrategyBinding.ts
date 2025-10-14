import {BindingKey} from "../../../di/binding";
import type {AuthStrategy} from "./types";
import {TokenAuthStrategy} from "./tokenAuthStrategy";

const AUTH_STRATEGY_TOKEN = Symbol('AUTH_STRATEGY');
export const authStrategyBinding = new BindingKey<AuthStrategy>(AUTH_STRATEGY_TOKEN, TokenAuthStrategy);
