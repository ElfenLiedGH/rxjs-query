import { BindingKey } from '@smwb/di';

const FETCH_SERVICE_TOKEN = Symbol('FETCH_SERVICE_TOKEN');
export const fetchServiceBinding = new BindingKey<typeof fetch>(
  FETCH_SERVICE_TOKEN
);
