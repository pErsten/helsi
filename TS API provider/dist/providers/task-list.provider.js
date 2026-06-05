import { ROUTES } from '../config/api.config';
function cleanParams(raw) {
    return Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined && v !== null));
}
function opts(userId, extra) {
    const o = { ...extra };
    if (userId !== undefined)
        o.userId = userId;
    return o;
}
/**
 * API operations for the `TaskList` route group.
 *
 * ```
 * GET    /TaskList/get?taskListId=…
 * PUT    /TaskList/create?taskListName=…        body: JSON string (tasks)
 * PATCH  /TaskList/update?taskListId=…&newTaskListName=…   body: JSON string (newTasks)
 * DELETE /TaskList/delete?taskListId=…
 * GET    /TaskList/getByUser?page=…&pageSize=…
 * ```
 */
export class TaskListProvider {
    constructor(http, defaultPageSize) {
        this.http = http;
        this.defaultPageSize = defaultPageSize;
    }
    /**
     * Returns name and tasks for a single list the caller can access.
     *
     * @throws {NotFoundError}   — list does not exist
     * @throws {ForbiddenError}  — caller has no access
     */
    get(taskListId, userId) {
        return this.http.get(ROUTES.taskList.get, opts(userId, { params: { taskListId } }));
    }
    /**
     * Creates a new task list owned by the current user.
     * `tasks` is sent as a JSON-encoded string in the request body.
     *
     * @throws {ValidationError} — validation failed (name, tasks, or missing X-User-Id)
     * @throws {ConflictError}   — a list with the same name already exists for this user
     */
    create(request, userId) {
        const { taskListName, tasks } = request;
        return this.http.put(ROUTES.taskList.create, tasks, opts(userId, { params: { taskListName } }));
    }
    /**
     * Updates name and tasks of an existing list.
     *
     * @throws {ForbiddenError}  — caller has no access
     * @throws {NotFoundError}   — list does not exist
     * @throws {ValidationError} — invalid input
     */
    update(request, userId) {
        const { taskListId, newTaskListName, newTasks } = request;
        return this.http.patch(ROUTES.taskList.update, newTasks, opts(userId, { params: { taskListId, newTaskListName } }));
    }
    /**
     * Soft-deletes a task list. Only the owner may delete.
     *
     * @throws {NotFoundError} — list does not exist or caller is not the owner
     */
    delete(taskListId, userId) {
        return this.http.delete(ROUTES.taskList.delete, opts(userId, { params: { taskListId } }));
    }
    /**
     * Returns task lists visible to the user (owned or shared), newest first.
     * Page is zero-based; pageSize defaults to the provider config value.
     */
    getByUser(params, userId) {
        return this.http.get(ROUTES.taskList.getByUser, opts(userId, {
            params: cleanParams({
                page: params?.page ?? 0,
                pageSize: params?.pageSize ?? this.defaultPageSize,
            }),
        }));
    }
}
//# sourceMappingURL=task-list.provider.js.map