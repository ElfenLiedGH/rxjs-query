export const Scope = {
  SINGLETON: 'singleton',
  TRANSIENT: 'transient',
} as const;

export const classMetadataKey = Symbol('classMetadataKey');

export const SimpleTypes = [
  'string',
  'number',
  'boolean',
  'object',
  'symbol',
  'undefined',
];
