import { BindingKey } from '@smwb/di';
import type { ObservableRequestService } from '../types/services/observableRequest.service';

const OBSERVABLE_REQUEST_SERVICE_BASE_URL_TOKEN = Symbol(
  'OBSERVABLE_REQUEST_SERVICE_BASE_URL_TOKEN'
);
export const observableRequestServiceBaseUrlBinding = new BindingKey<string>(
  OBSERVABLE_REQUEST_SERVICE_BASE_URL_TOKEN
);

const OBSERVABLE_REQUEST_SERVICE_TOKEN = Symbol(
  'OBSERVABLE_REQUEST_SERVICE_TOKEN'
);
export const observableRequestServiceBinding =
  new BindingKey<ObservableRequestService>(OBSERVABLE_REQUEST_SERVICE_TOKEN);
