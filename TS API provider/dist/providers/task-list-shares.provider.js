import { ROUTES } from '../config/api.config';
function opts(userId, extra) {
    const o = { ...extra };
    if (userId !== undefined)
        o.userId = userId;
    return o;
}
/**
 * API operations for the `TaskListShares` route group.
 *
 * ```
 * GET    /TaskListShares/get?taskListId=…
 * PUT    /TaskListShares/create?taskListId=…&sharedUserId=…
 * DELETE /TaskListShares/delete?taskListId=…&sharedUserId=…
 * ```
 */
export class TaskListSharesProvider {
    constructor(http) {
        this.http = http;
    }
    /**
     * Returns all share records (userId + status) for a task list.
     *
     * @throws {ForbiddenError} — caller has no access to this list
     */
    get(taskListId, userId) {
        return this.http.get(ROUTES.taskListShares.get, opts(userId, { params: { taskListId } }));
    }
    /**
     * Grants shared access to `sharedUserId`. Only the owner can share.
     *
     * @throws {ForbiddenError} — caller is not the owner
     * @throws {ConflictError}  — share already exists
     * @throws {ValidationError} — owner and shared user are the same
     */
    create(taskListId, sharedUserId, userId) {
        return this.http.put(ROUTES.taskListShares.create, undefined, opts(userId, { params: { taskListId, sharedUserId } }));
    }
    /**
     * Revokes access for `sharedUserId`.
     * Owners may remove any share; shared users may only remove themselves.
     *
     * @throws {NotFoundError}  — share does not exist
     * @throws {ForbiddenError} — shared user tried to remove someone else
     */
    delete(taskListId, sharedUserId, userId) {
        return this.http.delete(ROUTES.taskListShares.delete, opts(userId, { params: { taskListId, sharedUserId } }));
    }
}
//# sourceMappingURL=task-list-shares.provider.js.map