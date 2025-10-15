import { BindingKey } from '../../di/binding';
import type { RxJsRequest } from './rxJsRequest';

const RXJS_REQUEST_TOKEN = Symbol('RXJS_REQUEST');
export const rxJsRequestBinding = new BindingKey<RxJsRequest>(
  RXJS_REQUEST_TOKEN
);
