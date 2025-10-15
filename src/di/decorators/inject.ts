import { BindingKey } from '../binding';
import { classMetadataKey } from '../const';
import { Logger } from '../logger';

export function Inject<T>(binding: BindingKey<T>): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    const constructor =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      propertyKey === undefined ? (target as Function) : target.constructor;

    let meta = constructor[classMetadataKey];
    if (!meta) {
      meta = {
        dependencies: new Map(),
      };
      constructor[classMetadataKey] = meta;
    }

    meta.dependencies.set(parameterIndex, binding);

    Logger.log({ propertyKey, parameterIndex, binding }, 'inject dependency');
  };
}
