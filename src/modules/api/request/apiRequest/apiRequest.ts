import type {ApiRequestOptions} from "../types.ts";
import {Inject, Injectable} from "../../../di";
import {type AuthStrategy, authStrategyBinding} from "../auth";

export class ApiError extends Error {
    public status?: number
    public code?: string
    public details?: any

    constructor(
        message: string,
        status?: number,
        code?: string,
        details?: any,
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

    constructor(@Inject(authStrategyBinding) authStrategy: AuthStrategy) {
        this.authStrategy = authStrategy;
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
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers = new Headers(optionalHeaders);
        this.authStrategy.applyAuth(headers);

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
                // TODO дефолтные хеадеры еще можно
                headers: {
                    ...headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {

                if (this.authStrategy.shouldInvalidate(response)) {
                    await this.authStrategy.refreshToken();
                    return this.call<T>(url, {...options, tryRefreshToken: false});
                }

                let errorMessage = `HTTP Error: ${response.status}`;
                let errorDetails: any;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
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
                return await response.json();
            } catch (error) {
                throw new ApiError('Invalid JSON response', response.status);
            }

        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof ApiError) {
                throw error;
            } else if (error instanceof Error && "name" in error && error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408);
            } else if (error instanceof TypeError) {
                throw new ApiError('Network error: Failed to fetch');
            } else {
                throw new ApiError('Unknown error occurred');
            }
        }
    }
}

