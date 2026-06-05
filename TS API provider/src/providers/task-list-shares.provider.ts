import type { HttpClient, RequestOptions } from '../http/http-client';
import { ROUTES } from '../config/api.config';
import type { TaskListShareInfo } from '../types';

function opts(userId?: string, extra?: Omit<RequestOptions, 'userId'>): RequestOptions {
  const o: RequestOptions = { ...extra };
  if (userId !== undefined) o.userId = userId;
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
  constructor(private readonly http: HttpClient) {}

  /**
   * Returns all share records (userId + status) for a task list.
   *
   * @throws {ForbiddenError} — caller has no access to this list
   */
  get(taskListId: string, userId?: string): Promise<TaskListShareInfo[]> {
    return this.http.get<TaskListShareInfo[]>(
      ROUTES.taskListShares.get,
      opts(userId, { params: { taskListId } }),
    );
  }

  /**
   * Grants shared access to `sharedUserId`. Only the owner can share.
   *
   * @throws {ForbiddenError} — caller is not the owner
   * @throws {ConflictError}  — share already exists
   * @throws {ValidationError} — owner and shared user are the same
   */
  create(taskListId: string, sharedUserId: string, userId?: string): Promise<void> {
    return this.http.put<void>(
      ROUTES.taskListShares.create,
      undefined,
      opts(userId, { params: { taskListId, sharedUserId } }),
    );
  }

  /**
   * Revokes access for `sharedUserId`.
   * Owners may remove any share; shared users may only remove themselves.
   *
   * @throws {NotFoundError}  — share does not exist
   * @throws {ForbiddenError} — shared user tried to remove someone else
   */
  delete(taskListId: string, sharedUserId: string, userId?: string): Promise<void> {
    return this.http.delete<void>(
      ROUTES.taskListShares.delete,
      opts(userId, { params: { taskListId, sharedUserId } }),
    );
  }
}
