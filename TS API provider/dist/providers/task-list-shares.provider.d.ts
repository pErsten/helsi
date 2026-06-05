import type { HttpClient } from '../http/http-client';
import type { TaskListShareInfo } from '../types';
/**
 * API operations for the `TaskListShares` route group.
 *
 * ```
 * GET    /TaskListShares/get?taskListId=…
 * PUT    /TaskListShares/create?taskListId=…&sharedUserId=…
 * DELETE /TaskListShares/delete?taskListId=…&sharedUserId=…
 * ```
 */
export declare class TaskListSharesProvider {
    private readonly http;
    constructor(http: HttpClient);
    /**
     * Returns all share records (userId + status) for a task list.
     *
     * @throws {ForbiddenError} — caller has no access to this list
     */
    get(taskListId: string, userId?: string): Promise<TaskListShareInfo[]>;
    /**
     * Grants shared access to `sharedUserId`. Only the owner can share.
     *
     * @throws {ForbiddenError} — caller is not the owner
     * @throws {ConflictError}  — share already exists
     * @throws {ValidationError} — owner and shared user are the same
     */
    create(taskListId: string, sharedUserId: string, userId?: string): Promise<void>;
    /**
     * Revokes access for `sharedUserId`.
     * Owners may remove any share; shared users may only remove themselves.
     *
     * @throws {NotFoundError}  — share does not exist
     * @throws {ForbiddenError} — shared user tried to remove someone else
     */
    delete(taskListId: string, sharedUserId: string, userId?: string): Promise<void>;
}
//# sourceMappingURL=task-list-shares.provider.d.ts.map