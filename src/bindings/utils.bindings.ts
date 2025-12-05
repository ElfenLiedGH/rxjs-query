import { BindingKey } from '@smwb/di';

const UTILS_DEEP_COMPARATOR_TOKEN = Symbol('UTILS_DEEP_COMPARATOR_TOKEN');
export const deepComparatorBinding = new BindingKey<
  (a: unknown, b: unknown) => boolean
>(UTILS_DEEP_COMPARATOR_TOKEN);
