import type { HttpClient } from '../http/http-client';
import type { RequestOptions } from '../http/http-client';
import { ROUTES } from '../config/api.config';
import type {
  TaskList,
  TaskListShare,
  TaskListSummary,
  CreateTaskListDto,
  UpdateTaskListDto,
  AddShareDto,
  PaginatedResponse,
  GetTaskListsParams,
} from '../types';

// ─── Internal helper ──────────────────────────────────────────────────────────

/** Strips undefined / null entries so they are not stringified into the query. */
function cleanParams(
  raw: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined && v !== null),
  ) as Record<string, string | number | boolean>;
}

/** Builds a RequestOptions object, omitting userId when it is not supplied. */
function opts(userId?: string, extra?: Omit<RequestOptions, 'userId'>): RequestOptions {
  const o: RequestOptions = { ...extra };
  if (userId !== undefined) o.userId = userId;
  return o;
}

// ─── Provider ────────────────────────────────────────────────────────────────

/**
 * All API interactions for the TaskList resource.
 *
 * Every method accepts an optional `userId` override.
 * If omitted, the value set via `HelsiApiProvider.setUserId()` is used.
 *
 * ---
 * Quick reference:
 * ```
 * GET    /task-lists                        list()
 * POST   /task-lists                        create()
 * GET    /task-lists/:id                    getById()
 * PUT    /task-lists/:id                    update()
 * DELETE /task-lists/:id                    delete()
 * POST   /task-lists/:id/shares             addShare()
 * GET    /task-lists/:id/shares             getShares()
 * DELETE /task-lists/:id/shares/:userId     removeShare()
 * ```
 */
export class TaskListProvider {
  constructor(private readonly http: HttpClient) {}

  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Returns a paginated list of task lists visible to the current user.
   *
   * The server enforces visibility: only lists where the user is the owner
   * OR has a share link are returned.
   * Results are always sorted newest-first (server-side).
   *
   * @example
   * const { items, total } = await api.taskLists.list({ page: 1, pageSize: 10 }, 'user-123');
   */
  list(
    params?: GetTaskListsParams,
    userId?: string,
  ): Promise<PaginatedResponse<TaskListSummary>> {
    return this.http.get<PaginatedResponse<TaskListSummary>>(
      ROUTES.taskLists.collection,
      opts(userId, {
        params: cleanParams({ page: params?.page, pageSize: params?.pageSize }),
      }),
    );
  }

  /**
   * Returns the full TaskList entity including shares and timestamps.
   *
   * @throws {NotFoundError}  — list does not exist.
   * @throws {ForbiddenError} — user is neither owner nor shared user.
   *
   * @example
   * const list = await api.taskLists.getById('list-abc', 'user-123');
   */
  getById(id: string, userId?: string): Promise<TaskList> {
    return this.http.get<TaskList>(ROUTES.taskLists.byId(id), opts(userId));
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Creates a new task list owned by the current user.
   * Name must be 1–255 characters.
   *
   * @throws {ValidationError} — name fails server validation.
   *
   * @example
   * const list = await api.taskLists.create({ name: 'Sprint backlog' }, 'user-123');
   */
  create(dto: CreateTaskListDto, userId?: string): Promise<TaskList> {
    return this.http.post<TaskList>(ROUTES.taskLists.collection, dto, opts(userId));
  }

  /**
   * Replaces the name of an existing task list.
   *
   * @throws {NotFoundError}   — list does not exist.
   * @throws {ForbiddenError}  — user is not the owner or a shared user.
   * @throws {ValidationError} — new name is invalid.
   *
   * @example
   * const updated = await api.taskLists.update('list-abc', { name: 'New name' }, 'user-123');
   */
  update(id: string, dto: UpdateTaskListDto, userId?: string): Promise<TaskList> {
    return this.http.put<TaskList>(ROUTES.taskLists.byId(id), dto, opts(userId));
  }

  /**
   * Permanently deletes a task list.
   * Only the **owner** may call this — shared users receive 403.
   *
   * @throws {NotFoundError}  — list does not exist.
   * @throws {ForbiddenError} — user is not the owner.
   *
   * @example
   * await api.taskLists.delete('list-abc', 'user-123');
   */
  delete(id: string, userId?: string): Promise<void> {
    return this.http.delete<void>(ROUTES.taskLists.byId(id), opts(userId));
  }

  // ── Shares ────────────────────────────────────────────────────────────────

  /**
   * Returns all shares (userId + sharedAt) for a task list.
   *
   * @throws {NotFoundError}  — list does not exist.
   * @throws {ForbiddenError} — caller is not the owner or a shared user.
   *
   * @example
   * const shares = await api.taskLists.getShares('list-abc', 'user-123');
   */
  getShares(id: string, userId?: string): Promise<TaskListShare[]> {
    return this.http.get<TaskListShare[]>(ROUTES.taskLists.shares(id), opts(userId));
  }

  /**
   * Grants access to the task list for `dto.userId`.
   * Can be called by the owner or any already-shared user.
   *
   * @throws {NotFoundError}  — list does not exist.
   * @throws {ForbiddenError} — caller has no access.
   * @throws {ConflictError}  — share for that user already exists.
   *
   * @example
   * await api.taskLists.addShare('list-abc', { userId: 'user-456' }, 'user-123');
   */
  addShare(id: string, dto: AddShareDto, userId?: string): Promise<TaskListShare> {
    return this.http.post<TaskListShare>(ROUTES.taskLists.shares(id), dto, opts(userId));
  }

  /**
   * Revokes access from `targetUserId`.
   * Can be called by the owner or any already-shared user.
   *
   * @throws {NotFoundError}  — list or share does not exist.
   * @throws {ForbiddenError} — caller has no access.
   *
   * @example
   * await api.taskLists.removeShare('list-abc', 'user-456', 'user-123');
   */
  removeShare(id: string, targetUserId: string, userId?: string): Promise<void> {
    return this.http.delete<void>(
      ROUTES.taskLists.shareByUser(id, targetUserId),
      opts(userId),
    );
  }
}
