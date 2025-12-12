import { Inject, Injectable } from '@smwb/di';
import {
  authStrategySetAuthTokenBinding,
  fetchServiceBinding,
} from '../../bindings';
import { ApiError } from './apiError';
import type { FetchService } from '../../types/services/fetch.service';
import type {
  ApiRequestOptions,
  HTTPRequestService,
} from '../../types/services/HTTPRequest.service';
import type { AuthStrategy } from '../../types/strategies/auth.strategy';

@Injectable()
export class ApiRequest implements HTTPRequestService {
  private readonly authStrategy: AuthStrategy;
  private readonly fetch: FetchService;

  constructor(
    @Inject(fetchServiceBinding) fetchRequest: FetchService,
    @Inject(authStrategySetAuthTokenBinding) authStrategy: AuthStrategy
  ) {
    this.authStrategy = authStrategy;
    this.fetch = fetchRequest;
  }

  async call<T = unknown>(
    url: string,
    options: Omit<ApiRequestOptions, 'cacheTtl' | 'ignoreCache'> = {}
  ): Promise<T> {
    const {
      timeout = 10000,
      tryRefreshToken = true,
      headers: optionalHeaders = {},
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    const headers = new Headers(optionalHeaders);
    this.authStrategy.applyAuth(headers);
    
    if (fetchOptions.body instanceof FormData) {
      headers.delete('Content-Type');
    }

    try {
      const response = await this.fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        // TODO дефолтные хеадеры еще можно
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (tryRefreshToken && this.authStrategy.shouldInvalidate(response)) {
          await this.authStrategy.refreshToken();
          return await this.call<T>(url, {
            ...options,
            tryRefreshToken: false,
          });
        }

        let errorMessage = `HTTP Error: ${response.status.toString()}`;
        let errorDetails: unknown;

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const errorData = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          errorMessage = errorData.message ?? errorMessage;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          errorDetails = errorData.details;
        } catch {
          // Если не удалось распарсить JSON, используем стандартное сообщение
        }

        throw new ApiError(
          errorMessage,
          response.status,
          undefined,
          errorDetails
        );
      }

      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await response.json();
        } else {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await response.json();
          } catch {
            return (await response.text()) as unknown as T;
          }
        }
      } catch (_error) {
        throw new ApiError('Invalid response', response.status);
      }
    } catch (error) {
      clearTimeout(timeoutId);

      throw this.handleErrors(error);
    }
  }

  private handleErrors(error: unknown) {
    if (error instanceof ApiError) {
      return error;
    } else if (
      error instanceof Error &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      return new ApiError('Request timeout', 408);
    } else if (error instanceof TypeError) {
      return new ApiError('Network error: Failed to fetch');
    }
    return new ApiError('Unknown error occurred');
  }
}
