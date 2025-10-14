import {classMetadataKey, Scope, SimpleTypes} from "./const";
import {Binding, BindingKey} from "./binding";
import {BindingType} from "./binding/const";
import type {Newable} from "./binding/types";
import {Logger} from "./logger";


export class DIContainer {
    private registry: Map<symbol, Binding<unknown>> = new Map();
    private instances: Map<symbol, unknown> = new Map();

    bind<V>(key: BindingKey<V>) {
        const binding = new Binding<V>(key);
        this.registry.set(key.getKey(), binding);
        Logger.log({key: binding.getKey().getKey(), type: binding.getType(), scope: binding.getScope()}, `new bind`)
        return binding;
    }

    // Основной метод разрешения зависимостей
    resolve<V>(key: BindingKey<V>): V {

        let binding = this.registry.get(key.getKey()) as Binding<V> | undefined;

        const defaultBinding = key.getDefaultBinding();
        if (!binding && defaultBinding) {
            const newBinding = this.bind(key);
            if (SimpleTypes.some(t => t === typeof defaultBinding)) {
                newBinding.toConstant(defaultBinding as V);
            } else if (typeof defaultBinding === 'function') {
                if (defaultBinding.toString().startsWith('class')
                ) {
                    const scope = defaultBinding[classMetadataKey]?.scope || Scope.SINGLETON;
                    newBinding.toClass(defaultBinding as Newable).toScope(scope);
                } else {
                    newBinding.toFunction(defaultBinding);
                }
            }
            binding = newBinding;
        }


        if (!binding) {
            throw new Error(`No binding found for key: ${key.getKey().toString()}`)
        }

        if (binding.getType() === BindingType.CONSTANT) {
            return binding.getValue();
        }

        if (binding.getType() === BindingType.FUNCTION) {
            return binding.getFunction();
        }

        const cls = binding.getClass();
        const clsInstance = this.instances.get(key.getKey());
        if (clsInstance) {
            Logger.log({
                key: binding.getKey().getKey(),
                type: binding.getType(),
                scope: binding.getScope(),
                name: cls.constructor.name
            }, 'resolved');
            return clsInstance as V;
        }

        const args: unknown[] = [];
        cls[classMetadataKey]?.dependencies.forEach((dep, key) => {
            args[key] = this.resolve(dep);
        })

        const newClsInstance = new cls(...args);

        if (binding.getScope() === Scope.SINGLETON) {
            this.instances.set(key.getKey(), newClsInstance);
        }
        Logger.log({
            key: binding.getKey().getKey(),
            type: binding.getType(),
            scope: binding.getScope(),
            name: cls.constructor.name
        }, 'created and resolved');

        return newClsInstance;
    }

    public clear(): void {
        Logger.log('Clearing DI container cache');
        this.instances.clear();
    }
}

// Глобальный экземпляр контейнера
export const container = new DIContainer();