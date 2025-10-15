import { Inject, Injectable } from '../../di';
import { type AuthStrategy, authStrategyBinding } from '../auth';
import { fetchBinding } from './binding';
import type { ApiRequestOptions } from '../types.ts';

export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: unknown;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

@Injectable()
export class ApiRequest {
  // TODO дефолтные хеадеры еще можно
  private readonly authStrategy: AuthStrategy;
  private readonly fetch: typeof fetch;

  constructor(
    @Inject(fetchBinding) fetchRequest: typeof fetch,
    @Inject(authStrategyBinding) authStrategy: AuthStrategy
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
        // TODO тут может быть и не json
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await response.json();
      } catch (_error) {
        throw new ApiError('Invalid JSON response', response.status);
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
