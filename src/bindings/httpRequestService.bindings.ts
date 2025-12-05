import { BindingKey } from '@smwb/di';
import type { HTTPRequestService } from '../types/services/HTTPRequest.service';

const HTTP_REQUEST_SERVICE_TOKEN = Symbol('HTTP_REQUEST_SERVICE_TOKEN');
export const httpRequestServiceBinding = new BindingKey<HTTPRequestService>(
  HTTP_REQUEST_SERVICE_TOKEN
);
