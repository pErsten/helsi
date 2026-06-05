import type { HttpClient, RequestOptions } from '../http/http-client';
import { ROUTES } from '../config/api.config';
import type {
  TaskListResponse,
  TaskListByUser,
  CreateTaskListRequest,
  UpdateTaskListRequest,
  GetTaskListsByUserParams,
} from '../types';

function cleanParams(
  raw: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined && v !== null),
  ) as Record<string, string | number | boolean>;
}

function opts(userId?: string, extra?: Omit<RequestOptions, 'userId'>): RequestOptions {
  const o: RequestOptions = { ...extra };
  if (userId !== undefined) o.userId = userId;
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
  constructor(
    private readonly http: HttpClient,
    private readonly defaultPageSize: number,
  ) {}

  /**
   * Returns name and tasks for a single list the caller can access.
   *
   * @throws {NotFoundError}   — list does not exist
   * @throws {ForbiddenError}  — caller has no access
   */
  get(taskListId: string, userId?: string): Promise<TaskListResponse> {
    return this.http.get<TaskListResponse>(
      ROUTES.taskList.get,
      opts(userId, { params: { taskListId } }),
    );
  }

  /**
   * Creates a new task list owned by the current user.
   * `tasks` is sent as a JSON-encoded string in the request body.
   *
   * @throws {ValidationError} — validation failed (name, tasks, or missing X-User-Id)
   * @throws {ConflictError}   — a list with the same name already exists for this user
   */
  create(request: CreateTaskListRequest, userId?: string): Promise<void> {
    const { taskListName, tasks } = request;
    return this.http.put<void>(
      ROUTES.taskList.create,
      tasks,
      opts(userId, { params: { taskListName } }),
    );
  }

  /**
   * Updates name and tasks of an existing list.
   *
   * @throws {ForbiddenError}  — caller has no access
   * @throws {NotFoundError}   — list does not exist
   * @throws {ValidationError} — invalid input
   */
  update(request: UpdateTaskListRequest, userId?: string): Promise<void> {
    const { taskListId, newTaskListName, newTasks } = request;
    return this.http.patch<void>(
      ROUTES.taskList.update,
      newTasks,
      opts(userId, { params: { taskListId, newTaskListName } }),
    );
  }

  /**
   * Soft-deletes a task list. Only the owner may delete.
   *
   * @throws {NotFoundError} — list does not exist or caller is not the owner
   */
  delete(taskListId: string, userId?: string): Promise<void> {
    return this.http.delete<void>(
      ROUTES.taskList.delete,
      opts(userId, { params: { taskListId } }),
    );
  }

  /**
   * Returns task lists visible to the user (owned or shared), newest first.
   * Page is zero-based; pageSize defaults to the provider config value.
   */
  getByUser(
    params?: GetTaskListsByUserParams,
    userId?: string,
  ): Promise<TaskListByUser[]> {
    return this.http.get<TaskListByUser[]>(
      ROUTES.taskList.getByUser,
      opts(userId, {
        params: cleanParams({
          page: params?.page ?? 0,
          pageSize: params?.pageSize ?? this.defaultPageSize,
        }),
      }),
    );
  }
}
