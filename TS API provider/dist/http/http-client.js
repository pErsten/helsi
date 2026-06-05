import { USER_ID_HEADER } from '../config/api.config';
import { buildErrorFromResponse, NetworkError } from '../errors/api.errors';
/**
 * Thin fetch wrapper: header injection, JSON serialisation, timeouts, retries,
 * and typed error mapping.
 */
export class HttpClient {
    constructor(config) {
        this.currentUserId = null;
        this.config = config;
    }
    setUserId(userId) {
        this.currentUserId = userId;
    }
    clearUserId() {
        this.currentUserId = null;
    }
    get(path, opts) {
        return this.send('GET', path, opts);
    }
    put(path, body, opts) {
        return this.send('PUT', path, { ...opts, body });
    }
    patch(path, body, opts) {
        return this.send('PATCH', path, { ...opts, body });
    }
    delete(path, opts) {
        return this.send('DELETE', path, opts);
    }
    async send(method, path, opts = {}) {
        const url = this.buildUrl(path, opts.params);
        const headers = this.buildHeaders(opts);
        const timeout = opts.timeoutMs ?? this.config.timeoutMs;
        const maxTries = opts.noRetry ? 1 : this.config.retryAttempts + 1;
        const init = {
            method,
            headers,
            ...(opts.body !== undefined && { body: JSON.stringify(opts.body) }),
        };
        for (let attempt = 1; attempt <= maxTries; attempt++) {
            let response;
            try {
                response = await this.fetchWithTimeout(url, init, timeout);
            }
            catch (err) {
                const isLast = attempt === maxTries;
                if (isLast || !this.isTransientNetworkError(err)) {
                    throw new NetworkError(`Request failed: ${err.message}`, err);
                }
                await this.delay(this.config.retryDelayMs * 2 ** (attempt - 1));
                continue;
            }
            if (response.ok) {
                if (response.status === 204)
                    return undefined;
                const text = await response.text();
                if (!text)
                    return undefined;
                return JSON.parse(text);
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
    buildUrl(path, params) {
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
    buildHeaders(opts) {
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
    async fetchWithTimeout(url, init, ms) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
            return await fetch(url, { ...init, signal: controller.signal });
        }
        catch (err) {
            if (err.name === 'AbortError') {
                throw new Error(`Request timed out after ${ms} ms`);
            }
            throw err;
        }
        finally {
            clearTimeout(timer);
        }
    }
    isTransientNetworkError(err) {
        if (!(err instanceof Error))
            return false;
        return err.name === 'TypeError' || /timeout|network|failed to fetch/i.test(err.message);
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=http-client.js.map