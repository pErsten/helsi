import { USER_ID_HEADER } from '../types';

// ─── Configuration ────────────────────────────────────────────────────────────

export interface ApiConfig {
  /**
   * Root URL of the .NET backend without a trailing slash.
   * @example "http://localhost:5236"
   */
  baseUrl: string;

  /** Global request timeout in milliseconds */
  timeoutMs: number;

  /** Default page size when getByUser() is called without pageSize */
  defaultPageSize: number;

  /** Headers merged into every outgoing request */
  defaultHeaders: Record<string, string>;

  /** Automatic retries on 5xx / transient network errors (0 = disabled) */
  retryAttempts: number;

  /** Base delay (ms) between retries; doubled on each subsequent attempt */
  retryDelayMs: number;
}

export type ApiConfigInput = Partial<ApiConfig>;

export const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:5236',
  timeoutMs: 10_000,
  defaultPageSize: 20,
  defaultHeaders: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  retryAttempts: 2,
  retryDelayMs: 300,
};

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

// ─── Route table (mirrors TaskListControllersComposer / TaskListSharesControllersComposer) ──

export const ROUTES = {
  taskList: {
    get: '/TaskList/get',
    create: '/TaskList/create',
    update: '/TaskList/update',
    delete: '/TaskList/delete',
    getByUser: '/TaskList/getByUser',
  },
  taskListShares: {
    get: '/TaskListShares/get',
    create: '/TaskListShares/create',
    delete: '/TaskListShares/delete',
  },
} as const;

export { USER_ID_HEADER };
