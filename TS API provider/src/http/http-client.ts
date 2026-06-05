import type { ApiConfig } from '../config/api.config';
import { USER_ID_HEADER } from '../config/api.config';
import { buildErrorFromResponse, NetworkError } from '../errors/api.errors';

export interface RequestOptions {
  /** Sent as `X-User-Id`; overrides the value set via setUserId() */
  userId?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  noRetry?: boolean;
  params?: Record<string, string | number | boolean | null | undefined>;
}

type RequestWithBody = RequestOptions & { body?: unknown };

/**
 * Thin fetch wrapper: header injection, JSON serialisation, timeouts, retries,
 * and typed error mapping.
 */
export class HttpClient {
  private readonly config: ApiConfig;
  private currentUserId: string | null = null;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  clearUserId(): void {
    this.currentUserId = null;
  }

  get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.send<T>('GET', path, opts);
  }

  put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.send<T>('PUT', path, { ...opts, body });
  }

  patch<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.send<T>('PATCH', path, { ...opts, body });
  }

  delete<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.send<T>('DELETE', path, opts);
  }

  private async send<T>(
    method: string,
    path: string,
    opts: RequestWithBody = {},
  ): Promise<T> {
    const url = this.buildUrl(path, opts.params);
    const headers = this.buildHeaders(opts);
    const timeout = opts.timeoutMs ?? this.config.timeoutMs;
    const maxTries = opts.noRetry ? 1 : this.config.retryAttempts + 1;

    const init: RequestInit = {
      method,
      headers,
      ...(opts.body !== undefined && { body: JSON.stringify(opts.body) }),
    };

    for (let attempt = 1; attempt <= maxTries; attempt++) {
      let response: Response;

      try {
        response = await this.fetchWithTimeout(url, init, timeout);
      } catch (err) {
        const isLast = attempt === maxTries;
        if (isLast || !this.isTransientNetworkError(err)) {
          throw new NetworkError(`Request failed: ${(err as Error).message}`, err);
        }
        await this.delay(this.config.retryDelayMs * 2 ** (attempt - 1));
        continue;
      }

      if (response.ok) {
        if (response.status === 204) return undefined as T;
        const text = await response.text();
        if (!text) return undefined as T;
        return JSON.parse(text) as T;
      }

      const isServerError = response.status >= 500;
      const canRetry = isServerError && attempt < maxTries && !opts.noRetry;

      if (canRetry) {
        await this.delay(this.config.retryDelayMs * 2 ** (attempt - 1));
        continue;
      }

      throw await buildErrorFromResponse(response);
    }

    throw new NetworkError('Unexpected request termination');
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    const url = new URL(`${base}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private buildHeaders(opts: RequestOptions): Headers {
    const merged = new Headers(this.config.defaultHeaders);

    if (opts.headers) {
      for (const [k, v] of Object.entries(opts.headers)) {
        merged.set(k, v);
      }
    }

    const userId = opts.userId ?? this.currentUserId;
    if (userId) {
      merged.set(USER_ID_HEADER, userId);
    }

    return merged;
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    ms: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error(`Request timed out after ${ms} ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private isTransientNetworkError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    return err.name === 'TypeError' || /timeout|network|failed to fetch/i.test(err.message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
