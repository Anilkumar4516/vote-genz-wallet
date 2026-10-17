import { VoteWalletApiError, VoteWalletErrorCode } from '@vote-wallet/shared-types';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export class ApiError extends Error implements VoteWalletApiError {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;
  public readonly path?: string;

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    details?: Record<string, any>,
    path?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export class BaseApiClient {
  protected baseUrl: string;
  protected authToken?: string;
  protected timeoutMs: number;
  protected customFetch?: typeof fetch;

  constructor(config: {
    baseUrl?: string;
    authToken?: string;
    timeoutMs?: number;
    customFetch?: typeof fetch;
  } = {}) {
    this.baseUrl = (config.baseUrl || '').replace(/\/$/, '');
    this.authToken = config.authToken;
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.customFetch = config.customFetch;
  }

  setAuthToken(token: string | undefined): void {
    this.authToken = token;
  }

  getAuthToken(): string | undefined {
    return this.authToken;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/$/, '');
  }

  protected async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    const fetchImpl = this.customFetch ?? globalThis.fetch;
    const url = new URL(`${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, 'http://localhost');

    if (options.params) {
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined) {
          url.searchParams.append(key, String(val));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (this.authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const timeout = options.timeoutMs ?? this.timeoutMs;
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetchImpl(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: options.signal || controller.signal,
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        throw new ApiError(
          response.status,
          errorData.errorCode || errorData.error || VoteWalletErrorCode.INTERNAL_SERVER_ERROR,
          errorData.message || `Request failed with status ${response.status}`,
          errorData.details,
          endpoint,
        );
      }

      if (response.status === 204) {
        return null as unknown as T;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (err.name === 'AbortError') {
        throw new ApiError(
          408,
          VoteWalletErrorCode.SERVICE_UNAVAILABLE,
          `Request to ${endpoint} timed out after ${timeout}ms`,
          undefined,
          endpoint,
        );
      }
      throw new ApiError(
        500,
        VoteWalletErrorCode.INTERNAL_SERVER_ERROR,
        err.message || 'Network request failed',
        undefined,
        endpoint,
      );
    } finally {
      clearTimeout(timeoutTimer);
    }
  }

  protected get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  protected post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'POST', body, options);
  }

  protected put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body, options);
  }

  protected patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', body, options);
  }

  protected delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
}
