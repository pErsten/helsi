import { buildConfig } from '../config/api.config';
import { HttpClient } from '../http/http-client';
import { TaskListProvider } from './task-list.provider';
import { TaskListSharesProvider } from './task-list-shares.provider';
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
export class HelsiApiProvider {
    constructor(config) {
        const resolved = buildConfig(config);
        this.http = new HttpClient(resolved);
        this.taskLists = new TaskListProvider(this.http, resolved.defaultPageSize);
        this.taskListShares = new TaskListSharesProvider(this.http);
    }
    /** Sets `X-User-Id` for all subsequent requests (overridable per call) */
    setUserId(userId) {
        this.http.setUserId(userId);
        return this;
    }
    clearUserId() {
        this.http.clearUserId();
        return this;
    }
}
//# sourceMappingURL=index.js.map