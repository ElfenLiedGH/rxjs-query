import { Scope } from '../const';
import { Logger } from '../logger';
import { BindingKey } from './bindingKey';
import { BindingType } from './const';
import type {
  ScopeEnum,
  BindingTypeEnum,
  BindingSource,
  Newable,
} from './types';

export class Binding<V> {
  private type: BindingTypeEnum | undefined;
  private scope: ScopeEnum;
  private readonly key: BindingKey<V>;
  private source: BindingSource<V> | undefined;

  constructor(key: BindingKey<V>) {
    this.scope = Scope.SINGLETON;
    this.key = key;
  }

  public getKey(): BindingKey<V> {
    return this.key;
  }

  public getType(): BindingTypeEnum | undefined {
    return this.type;
  }

  public getScope(): ScopeEnum {
    return this.scope;
  }

  public getClass(): Newable<V> {
    if (this.type !== BindingType.CLASS) {
      throw new Error(
        `Binding type is not class ${this.getSourceBindingErrorText()}`
      );
    }
    if (!this.source) {
      throw new Error(
        `Binding source is not set ${this.getSourceBindingErrorText()}`
      );
    }
    return this.source as Newable<V>;
  }

  private getSourceBindingErrorText() {
    return `${this.source?.toString() ?? ''} ${this.key.getDefaultBinding()?.toString() ?? ''}`;
  }

  public getValue(): V {
    if (this.type !== BindingType.CONSTANT) {
      throw new Error(
        `Binding type is not constant ${this.getSourceBindingErrorText()}`
      );
    }
    if (!this.source) {
      throw new Error(
        `Binding source is not set ${this.getSourceBindingErrorText()}`
      );
    }
    return this.source as V;
  }

  public getFunction(): V {
    if (this.type !== BindingType.FUNCTION) {
      throw new Error(
        `Binding type is not function ${this.getSourceBindingErrorText()}`
      );
    }
    if (!this.source) {
      throw new Error(
        `Binding source is not set ${this.getSourceBindingErrorText()}`
      );
    }
    return this.source as V;
  }

  public toScope(scope: ScopeEnum): this {
    this.scope = scope;
    Logger.log(
      { key: this.key, type: this.type, value: this.source, scope: this.scope },
      `Binding to scope`
    );
    return this;
  }

  public toClass(cls: Newable<V>): this {
    if (this.type && this.type !== BindingType.CLASS) {
      throw new Error(`Binding type already set to ${this.type}`);
    }
    this.type = BindingType.CLASS;
    this.source = cls;
    Logger.log(
      { key: this.key, type: this.type, value: this.source, scope: this.scope },
      `New binding`
    );
    return this;
  }

  public toConstant(v: V): this {
    if (this.type && this.type !== BindingType.CONSTANT) {
      throw new Error(`Binding type already set to ${this.type}`);
    }
    this.type = BindingType.CONSTANT;
    this.source = v;
    Logger.log(
      { key: this.key, type: this.type, value: this.source, scope: this.scope },
      `New binding`
    );
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  public toFunction(fn: Function): this {
    if (this.type && this.type !== BindingType.FUNCTION) {
      throw new Error(`Binding type already set to ${this.type}`);
    }
    this.type = BindingType.FUNCTION;
    this.source = fn;
    Logger.log(
      { key: this.key, type: this.type, value: this.source, scope: this.scope },
      `New binding`
    );
    return this;
  }
}
