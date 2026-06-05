import { USER_ID_HEADER } from '../types';
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
export declare const DEFAULT_CONFIG: ApiConfig;
export declare function buildConfig(overrides?: ApiConfigInput): ApiConfig;
export declare const ROUTES: {
    readonly taskList: {
        readonly get: "/TaskList/get";
        readonly create: "/TaskList/create";
        readonly update: "/TaskList/update";
        readonly delete: "/TaskList/delete";
        readonly getByUser: "/TaskList/getByUser";
    };
    readonly taskListShares: {
        readonly get: "/TaskListShares/get";
        readonly create: "/TaskListShares/create";
        readonly delete: "/TaskListShares/delete";
    };
};
export { USER_ID_HEADER };
//# sourceMappingURL=api.config.d.ts.map