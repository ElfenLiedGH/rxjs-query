import { classMetadataKey } from './const';
import type { BindingKey, ScopeEnum } from './binding';

export interface ClassMetadata {
  scope?: ScopeEnum;
  dependencies: Map<number, BindingKey<unknown>>;
}

export type EnumObject<T> = T[keyof T];

declare global {
  interface Function {
    [classMetadataKey]?: ClassMetadata;
  }
}
