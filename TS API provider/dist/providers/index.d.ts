import type { ApiConfigInput } from '../config/api.config';
import { TaskListProvider } from './task-list.provider';
import { TaskListSharesProvider } from './task-list-shares.provider';
export type { ApiConfigInput };
/**
 * Top-level facade: configuration, HTTP client, and resource providers.
 *
 * ```ts
 * import { HelsiApiProvider } from 'helsi-api-provider';
 *
 * const api = new HelsiApiProvider({ baseUrl: 'http://localhost:5236' });
 * api.setUserId('user-123');
 *
 * await api.taskLists.create({ taskListName: 'Sprint', tasks: '- item 1' });
 * const lists = await api.taskLists.getByUser({ page: 0, pageSize: 10 });
 * const detail = await api.taskLists.get(lists[0]!.taskListId);
 *
 * await api.taskListShares.create(lists[0]!.taskListId, 'user-456');
 * const shares = await api.taskListShares.get(lists[0]!.taskListId);
 * ```
 */
export declare class HelsiApiProvider {
    private readonly http;
    readonly taskLists: TaskListProvider;
    readonly taskListShares: TaskListSharesProvider;
    constructor(config?: ApiConfigInput);
    /** Sets `X-User-Id` for all subsequent requests (overridable per call) */
    setUserId(userId: string): this;
    clearUserId(): this;
}
//# sourceMappingURL=index.d.ts.map