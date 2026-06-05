import type { HttpClient } from '../http/http-client';
import type { TaskListResponse, TaskListByUser, CreateTaskListRequest, UpdateTaskListRequest, GetTaskListsByUserParams } from '../types';
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
export declare class TaskListProvider {
    private readonly http;
    private readonly defaultPageSize;
    constructor(http: HttpClient, defaultPageSize: number);
    /**
     * Returns name and tasks for a single list the caller can access.
     *
     * @throws {NotFoundError}   — list does not exist
     * @throws {ForbiddenError}  — caller has no access
     */
    get(taskListId: string, userId?: string): Promise<TaskListResponse>;
    /**
     * Creates a new task list owned by the current user.
     * `tasks` is sent as a JSON-encoded string in the request body.
     *
     * @throws {ValidationError} — validation failed (name, tasks, or missing X-User-Id)
     * @throws {ConflictError}   — a list with the same name already exists for this user
     */
    create(request: CreateTaskListRequest, userId?: string): Promise<void>;
    /**
     * Updates name and tasks of an existing list.
     *
     * @throws {ForbiddenError}  — caller has no access
     * @throws {NotFoundError}   — list does not exist
     * @throws {ValidationError} — invalid input
     */
    update(request: UpdateTaskListRequest, userId?: string): Promise<void>;
    /**
     * Soft-deletes a task list. Only the owner may delete.
     *
     * @throws {NotFoundError} — list does not exist or caller is not the owner
     */
    delete(taskListId: string, userId?: string): Promise<void>;
    /**
     * Returns task lists visible to the user (owned or shared), newest first.
     * Page is zero-based; pageSize defaults to the provider config value.
     */
    getByUser(params?: GetTaskListsByUserParams, userId?: string): Promise<TaskListByUser[]>;
}
//# sourceMappingURL=task-list.provider.d.ts.map