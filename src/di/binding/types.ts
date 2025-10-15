import { Scope } from '../const';
import { BindingType } from './const';
import type { EnumObject } from '../types.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Newable<T = any> = new (...args: any[]) => T;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type BindingSource<V> = Newable<V> | V | Function;

export type BindingTypeEnum = EnumObject<typeof BindingType>;
export type ScopeEnum = EnumObject<typeof Scope>;
