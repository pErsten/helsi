import type { ApiConfig } from '../config/api.config';
export interface RequestOptions {
    /** Sent as `X-User-Id`; overrides the value set via setUserId() */
    userId?: string;
    timeoutMs?: number;
    headers?: Record<string, string>;
    noRetry?: boolean;
    params?: Record<string, string | number | boolean | null | undefined>;
}
/**
 * Thin fetch wrapper: header injection, JSON serialisation, timeouts, retries,
 * and typed error mapping.
 */
export declare class HttpClient {
    private readonly config;
    private currentUserId;
    constructor(config: ApiConfig);
    setUserId(userId: string): void;
    clearUserId(): void;
    get<T>(path: string, opts?: RequestOptions): Promise<T>;
    put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
    patch<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T>;
    delete<T>(path: string, opts?: RequestOptions): Promise<T>;
    private send;
    private buildUrl;
    private buildHeaders;
    private fetchWithTimeout;
    private isTransientNetworkError;
    private delay;
}
//# sourceMappingURL=http-client.d.ts.map