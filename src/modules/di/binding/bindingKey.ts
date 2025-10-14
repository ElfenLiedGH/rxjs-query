import type {Newable} from "./types";
import {Logger} from "../logger";

export class BindingKey<V> {
    private readonly key: symbol
    private readonly defaultBinding: Newable<V> | V | undefined

    constructor(key: symbol, defaultBinding?: Newable<V> | V) {
        this.key = key
        this.defaultBinding = defaultBinding
        Logger.log({key: this.key.toString(), defaultBinding: this.defaultBinding}, 'BindingKey created')
    }

    public getKey(): symbol {
        return this.key
    }

    public getDefaultBinding(): Newable<V> | V | undefined {
        return this.defaultBinding
    }
}