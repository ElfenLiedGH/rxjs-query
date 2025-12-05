import type { QueryParams } from '../../types/services/observableRequest.service';

function addLeading(url: string): string {
  return url.startsWith('/') ? url : '/' + url;
}

export function getQueryUrl<P extends Record<string, string>>(
  queryUrl: string | QueryParams<P>
): string {
  if (typeof queryUrl === 'string') {
    return addLeading(queryUrl);
  }
  const url = queryUrl.url;
  const searchParams = queryUrl.searchParams;
  const params = new URLSearchParams(searchParams).toString();
  const divider = ~url.indexOf('?') ? '&' : '?';
  return `${addLeading(url)}${divider}${params}`;
}
