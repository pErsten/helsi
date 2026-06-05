import { buildConfig } from '../config/api.config';
import type { ApiConfigInput } from '../config/api.config';
import { HttpClient } from '../http/http-client';
import { TaskListProvider } from './task-list.provider';

export type { ApiConfigInput };

/**
 * Top-level facade that wires configuration, the HTTP client, and all
 * resource providers together into a single importable object.
 *
 * ## Basic usage
 *
 * ```ts
 * import { HelsiApiProvider } from './providers';
 *
 * const api = new HelsiApiProvider({ baseUrl: 'http://localhost:5000/api' });
 * api.setUserId('user-123');          // set once, used for all subsequent calls
 *
 * // List task lists (paginated, newest first)
 * const { items } = await api.taskLists.list({ page: 1, pageSize: 20 });
 *
 * // Create a list
 * const list = await api.taskLists.create({ name: 'My first list' });
 *
 * // Share it with another user
 * await api.taskLists.addShare(list.id, { userId: 'user-456' });
 *
 * // Per-request userId override (useful in server-side contexts)
 * const other = await api.taskLists.getById(list.id, 'user-456');
 * ```
 *
 * ## Error handling
 *
 * ```ts
 * import {
 *   ValidationError,
 *   ForbiddenError,
 *   NotFoundError,
 *   HelsiApiError,
 *   NetworkError,
 * } from './errors/api.errors';
 *
 * try {
 *   await api.taskLists.delete(id);
 * } catch (err) {
 *   if (err instanceof ForbiddenError) { // only owner can delete }
 *   if (err instanceof NotFoundError)  { // list was already removed }
 *   if (err instanceof HelsiApiError)  { // any other HTTP-level error }
 *   if (err instanceof NetworkError)   { // connectivity / timeout }
 * }
 * ```
 */
export class HelsiApiProvider {
  private readonly http: HttpClient;

  /** Provides all task-list operations */
  public readonly taskLists: TaskListProvider;

  constructor(config?: ApiConfigInput) {
    const resolved  = buildConfig(config);
    this.http       = new HttpClient(resolved);
    this.taskLists  = new TaskListProvider(this.http);
  }

  // ── User identity helpers ──────────────────────────────────────────────────

  /**
   * Set the global user ID sent with every request as `X-User-Id`.
   * Can be overridden per-call by passing `userId` directly to any method.
   */
  setUserId(userId: string): this {
    this.http.setUserId(userId);
    return this;            // fluent — allows new HelsiApiProvider().setUserId('x')
  }

  clearUserId(): this {
    this.http.clearUserId();
    return this;
  }
}
