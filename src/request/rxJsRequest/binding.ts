import { BindingKey } from '../../di/binding';

const RXJS_BASE_URL_TOKEN = Symbol('RXJS_BASE_URL');
export const rxjsBaseUrlBinding = new BindingKey<string>(RXJS_BASE_URL_TOKEN);
