import type { ApiConfig } from '../config/api.config';
import { USER_ID_HEADER } from '../config/api.config';
import { buildErrorFromResponse, NetworkError } from '../errors/api.errors';

// ─── Per-request options ──────────────────────────────────────────────────────

export interface RequestOptions {
  /**
   * ID of the user making the request.
   * Sent as the `X-User-Id` header on every call.
   * Can be set globally via HttpClient.setUserId() or per-request here.
   */
  userId?: string;

  /** Per-request timeout override (ms). Falls back to config.timeoutMs. */
  timeoutMs?: number;

  /** Extra headers merged on top of the defaults. */
  headers?: Record<string, string>;

  /** Disable automatic retries for this specific request. */
  noRetry?: boolean;

  /**
   * Query-string parameters.
   * undefined / null values are silently dropped (not appended as empty strings).
   */
  params?: Record<string, string | number | boolean | null | undefined>;
}

type RequestWithBody = RequestOptions & { body?: unknown };

// ─── HTTP Client ──────────────────────────────────────────────────────────────

/**
 * Thin fetch wrapper that handles:
 * - Automatic `X-User-Id` header injection
 * - JSON serialisation / deserialisation
 * - Request timeouts (AbortController)
 * - Exponential-backoff retries on 5xx and network errors
 * - Typed error mapping (see buildErrorFromResponse)
 *
 * A single instance is shared across all providers.
 */
export class HttpClient {
  private readonly config: ApiConfig;
  private currentUserId: string | null = null;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  // ── Global user identity ───────────────────────────────────────────────────

  /**
   * Set the user ID that will be attached to every subsequent request
   * unless overridden at the call site.
   */
  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  clearUserId(): void {
    this.currentUserId = null;
  }

  // ── Convenience verb methods ───────────────────────────────────────────────

  get<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.send<T>('GET', path, opts);
  }

  post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.send<T>('POST', path, { ...opts, body });
  }

  put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return this.send<T>('PUT', path, { ...opts, body });
  }

  delete<T>(path: string, opts?: RequestOptions): Promise<T> {
    return this.send<T>('DELETE', path, opts);
  }

  // ── Core send ──────────────────────────────────────────────────────────────

  private async send<T>(
    method: string,
    path: string,
    opts: RequestWithBody = {},
  ): Promise<T> {
    const url      = this.buildUrl(path, opts.params);
    const headers  = this.buildHeaders(opts);
    const timeout  = opts.timeoutMs ?? this.config.timeoutMs;
    const maxTries = opts.noRetry ? 1 : this.config.retryAttempts + 1;

    const init: RequestInit = {
      method,
      headers,
      ...(opts.body !== undefined && { body: JSON.stringify(opts.body) }),
    };

    for (let attempt = 1; attempt <= maxTries; attempt++) {
      let response: Response;

      // ── Fetch with timeout ────────────────────────────────────────────────
      try {
        response = await this.fetchWithTimeout(url, init, timeout);
      } catch (err) {
        const isLast = attempt === maxTries;
        if (isLast || !this.isTransientNetworkError(err)) {
          throw new NetworkError(
            `Request failed: ${(err as Error).message}`,
            err,
          );
        }
        await this.delay(this.config.retryDelayMs * 2 ** (attempt - 1));
        continue;
      }

      // ── Happy path ────────────────────────────────────────────────────────
      if (response.ok) {
        if (response.status === 204) return undefined as T;
        return response.json() as Promise<T>;
      }

      // ── Retry on 5xx ──────────────────────────────────────────────────────
      const isServerError = response.status >= 500;
      const canRetry      = isServerError && attempt < maxTries && !opts.noRetry;

      if (canRetry) {
        await this.delay(this.config.retryDelayMs * 2 ** (attempt - 1));
        continue;
      }

      // ── Map to typed error and throw ──────────────────────────────────────
      throw await buildErrorFromResponse(response);
    }

    // Unreachable — satisfies TypeScript exhaustiveness check
    throw new NetworkError('Unexpected request termination');
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    const url  = new URL(`${base}${path}`);

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

    // Extra per-request headers
    if (opts.headers) {
      for (const [k, v] of Object.entries(opts.headers)) {
        merged.set(k, v);
      }
    }

    // User ID: per-request takes priority over globally set value
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
    const timer      = setTimeout(() => controller.abort(), ms);

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
    return (
      err.name === 'TypeError' ||
      /timeout|network|failed to fetch/i.test(err.message)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
