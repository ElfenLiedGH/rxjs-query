import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Типы для REST API
export interface RestApiConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
}

export interface RestApiRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

export interface RestApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export class RestApiService {
  private config: RestApiConfig;

  constructor(config: RestApiConfig) {
    this.config = config;
  }

  /**
   * Выполняет REST запрос
   * @param request Параметры запроса
   * @returns Observable с результатом запроса
   */
  request<T = any>(request: RestApiRequest): Observable<RestApiResponse<T>> {
    const url = this.buildUrl(request.url);
    const options = this.buildOptions(request);
    
    return from(fetch(url, options)).pipe(
      map(async response => {
        const data = await response.json();
        return {
          data,
          status: response.status,
          headers: response.headers
        };
      }),
      map(promise => from(promise)),
      catchError(error => {
        throw new Error(`REST API request failed: ${error.message}`);
      })
    ).pipe(
      // Преобразуем Observable<Observable<RestApiResponse<T>>> в Observable<RestApiResponse<T>>
      map(obs => obs)
    ) as unknown as Observable<RestApiResponse<T>>;
  }

  /**
   * Выполняет GET запрос
   * @param url URL endpoint
   * @param headers Дополнительные заголовки
   * @returns Observable с результатом запроса
   */
  get<T = any>(url: string, headers?: Record<string, string>): Observable<RestApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', headers });
  }

  /**
   * Выполняет POST запрос
   * @param url URL endpoint
   * @param body Тело запроса
   * @param headers Дополнительные заголовки
   * @returns Observable с результатом запроса
   */
  post<T = any>(url: string, body?: any, headers?: Record<string, string>): Observable<RestApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', body, headers });
  }

  /**
   * Выполняет PUT запрос
   * @param url URL endpoint
   * @param body Тело запроса
   * @param headers Дополнительные заголовки
   * @returns Observable с результатом запроса
   */
  put<T = any>(url: string, body?: any, headers?: Record<string, string>): Observable<RestApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', body, headers });
  }

  /**
   * Выполняет DELETE запрос
   * @param url URL endpoint
   * @param headers Дополнительные заголовки
   * @returns Observable с результатом запроса
   */
  delete<T = any>(url: string, headers?: Record<string, string>): Observable<RestApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', headers });
  }

  /**
   * Выполняет PATCH запрос
   * @param url URL endpoint
   * @param body Тело запроса
   * @param headers Дополнительные заголовки
   * @returns Observable с результатом запроса
   */
  patch<T = any>(url: string, body?: any, headers?: Record<string, string>): Observable<RestApiResponse<T>> {
    return this.request<T>({ url, method: 'PATCH', body, headers });
  }

  private buildUrl(endpoint: string): string {
    // Если endpoint уже является полным URL, возвращаем его как есть
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Иначе объединяем с baseUrl
    const baseUrl = this.config.baseUrl.endsWith('/') ? this.config.baseUrl.slice(0, -1) : this.config.baseUrl;
    const endpointPath = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    
    return baseUrl + endpointPath;
  }

  private buildOptions(request: RestApiRequest): RequestInit {
    const method = request.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.defaultHeaders,
      ...request.headers
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (request.body) {
      options.body = JSON.stringify(request.body);
    }

    return options;
  }
}