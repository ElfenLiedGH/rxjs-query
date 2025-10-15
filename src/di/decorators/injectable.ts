import { classMetadataKey, Scope } from '../const';
import { Logger } from '../logger';
import type { Newable } from '../binding/types';
import type { EnumObject } from '../types.ts';

export function Injectable(
  options: { scope: EnumObject<typeof Scope> } = {
    scope: Scope.SINGLETON,
  }
): ClassDecorator {
  return ((target: Newable<unknown>) => {
    let meta = target[classMetadataKey];
    if (!meta) {
      meta = {
        dependencies: new Map(),
      };
      target[classMetadataKey] = meta;
    }
    meta.scope = options.scope;

    Logger.log(
      { name: target.name, meta },
      `Registered ${target.name} with dependencies`
    );
  }) as ClassDecorator;
}
