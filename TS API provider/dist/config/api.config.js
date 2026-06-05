import { USER_ID_HEADER } from '../types';
export const DEFAULT_CONFIG = {
    baseUrl: 'http://localhost:5236',
    timeoutMs: 10000,
    defaultPageSize: 20,
    defaultHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    retryAttempts: 2,
    retryDelayMs: 300,
};
export function buildConfig(overrides) {
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
};
export { USER_ID_HEADER };
//# sourceMappingURL=api.config.js.map