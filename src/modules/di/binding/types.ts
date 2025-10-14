import {BindingType} from "./const";
import {Scope} from "../";
import type {EnumObject} from "../types.ts";

export type Newable<T = any> = new (...args: any[]) => T;

export type BindingSource<V> = Newable<V> | V | Function;


export type BindingTypeEnum = EnumObject<typeof BindingType>
export type ScopeEnum = EnumObject<typeof Scope>