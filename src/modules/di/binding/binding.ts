import type {ScopeEnum} from "./types";
import {Scope} from "../const";
import {BindingKey} from "./bindingKey";
import {BindingType} from "./const";
import type {BindingTypeEnum, BindingSource, Newable} from "./types";
import {Logger} from "../logger";

export class Binding<V> {
    private type: BindingTypeEnum | undefined;
    private scope: ScopeEnum;
    private readonly key: BindingKey<V>;
    private source: BindingSource<V> | undefined

    constructor(key: BindingKey<V>) {
        this.scope = Scope.SINGLETON;
        this.key = key
    }

    public getKey(): BindingKey<V> {
        return this.key
    }

    public getType(): BindingTypeEnum | undefined {
        return this.type
    }

    public getScope(): ScopeEnum {
        return this.scope
    }

    public getClass(): Newable<V> {
        if (this.type !== BindingType.CLASS) {
            throw new Error(`Binding type is not class ${this.source} ${this.key.getDefaultBinding()}`)
        }
        if (!this.source) {
            throw new Error(`Binding source is not set ${this.source} ${this.key.getDefaultBinding()}`)
        }
        return this.source as Newable<V>;
    }

    public getValue(): V {
        if (this.type !== BindingType.CONSTANT) {
            throw new Error(`Binding type is not constant ${this.source} ${this.key.getDefaultBinding()}`)
        }
        if (!this.source) {
            throw new Error(`Binding source is not set ${this.source} ${this.key.getDefaultBinding()}`)
        }
        return this.source as V;
    }

    public getFunction(): V {
        if (this.type !== BindingType.FUNCTION) {
            throw new Error(`Binding type is not function ${this.source} ${this.key.getDefaultBinding()}`)
        }
        if (!this.source) {
            throw new Error(`Binding source is not set ${this.source} ${this.key.getDefaultBinding()}`)
        }
        return this.source as V;
    }

    public toScope(scope: ScopeEnum): Binding<V> {
        this.scope = scope
        Logger.log({key: this.key, type: this.type, value: this.source, scope: this.scope}, `Binding to scope`)
        return this;
    }

    public toClass(cls: Newable<V>): Binding<V> {
        if (this.type && this.type !== BindingType.CLASS) {
            throw new Error(`Binding type already set to ${this.type}`)
        }
        this.type = BindingType.CLASS;
        this.source = cls;
        Logger.log({key: this.key, type: this.type, value: this.source, scope: this.scope}, `New binding`)
        return this;
    }

    public toConstant(v: V): Binding<V> {
        if (this.type && this.type !== BindingType.CONSTANT) {
            throw new Error(`Binding type already set to ${this.type}`)
        }
        this.type = BindingType.CONSTANT;
        this.source = v;
        Logger.log({key: this.key, type: this.type, value: this.source, scope: this.scope}, `New binding`)
        return this;
    }

    public toFunction(fn: Function): Binding<V> {
        if (this.type && this.type !== BindingType.FUNCTION) {
            throw new Error(`Binding type already set to ${this.type}`)
        }
        this.type = BindingType.FUNCTION;
        this.source = fn;
        Logger.log({key: this.key, type: this.type, value: this.source, scope: this.scope}, `New binding`)
        return this;
    }

}