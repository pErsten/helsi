import { USER_ID_HEADER } from '../types';

// ─── Shape of the configuration object ───────────────────────────────────────

export interface ApiConfig {
  /**
   * Root URL of the .NET backend without a trailing slash.
   * @example "http://localhost:5000/api"
   */
  baseUrl: string;

  /**
   * Global request timeout in milliseconds.
   * Individual requests can override this via RequestOptions.
   */
  timeoutMs: number;

  /**
   * Default page size used when the caller doesn't supply one.
   */
  defaultPageSize: number;

  /**
   * Headers merged into every outgoing request.
   * Caller-supplied headers always win over these defaults.
   */
  defaultHeaders: Record<string, string>;

  /**
   * How many times to retry automatically on 5xx / network errors.
   * Set to 0 to disable retries.
   */
  retryAttempts: number;

  /**
   * Base delay (ms) between retries. Doubled on each subsequent attempt.
   */
  retryDelayMs: number;
}

/** Partial overrides accepted at construction time */
export type ApiConfigInput = Partial<ApiConfig>;

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:5000/api',
  timeoutMs: 10_000,
  defaultPageSize: 20,
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  retryAttempts: 2,
  retryDelayMs: 300,
};

/**
 * Merge caller-supplied overrides on top of the defaults.
 * The `defaultHeaders` object is merged shallowly so individual
 * header overrides do not wipe out the Content-Type / Accept defaults.
 */
export function buildConfig(overrides?: ApiConfigInput): ApiConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    defaultHeaders: {
      ...DEFAULT_CONFIG.defaultHeaders,
      ...overrides?.defaultHeaders,
    },
  };
}

// ─── Route table ─────────────────────────────────────────────────────────────

/**
 * Single source of truth for every API path.
 * Functions accept IDs so the paths are never constructed inline.
 */
export const ROUTES = {
  taskLists: {
    /** GET /task-lists  |  POST /task-lists */
    collection: '/task-lists',
    /** GET /task-lists/:id  |  PUT /task-lists/:id  |  DELETE /task-lists/:id */
    byId: (id: string) => `/task-lists/${id}`,
    /** POST /task-lists/:id/shares  |  GET /task-lists/:id/shares */
    shares: (id: string) => `/task-lists/${id}/shares`,
    /** DELETE /task-lists/:id/shares/:userId */
    shareByUser: (id: string, userId: string) =>
      `/task-lists/${id}/shares/${userId}`,
  },
} as const;

// Export the header constant from types so consumers only need one import
export { USER_ID_HEADER };
