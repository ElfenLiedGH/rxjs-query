import {BindingKey} from "../binding";
import {classMetadataKey} from "../const";
import {Logger} from "../logger.ts";

export function Inject<T>(binding: BindingKey<T>): ParameterDecorator {

    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        const constructor = propertyKey === undefined
            ? (target as Function)
            : (target.constructor as Function);

        let meta = constructor[classMetadataKey];
        if (!meta) {
            meta = {
                dependencies: new Map()
            }
            constructor[classMetadataKey] = meta;
        }

        meta.dependencies.set(parameterIndex, binding);


        Logger.log({propertyKey, parameterIndex, binding}, 'inject dependency')

    };
}