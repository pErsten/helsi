// ─── Primitives ───────────────────────────────────────────────────────────────

/** ISO 8601 datetime string — e.g. "2025-08-20T10:30:00.000Z" */
export type ISODateString = string;

// ─── Core entities ────────────────────────────────────────────────────────────

/**
 * Full TaskList entity returned by GET /task-lists/:id.
 * Contains owner, all shares, and timestamps.
 */
export interface TaskList {
  id: string;
  name: string;
  ownerId: string;
  shares: TaskListShare[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Lightweight summary returned by GET /task-lists (list endpoint).
 * Only id + name as per the spec ("достатньо отримати обмежений об'єм даних").
 */
export interface TaskListSummary {
  id: string;
  name: string;
}

/** A single share record — which user has access to the list and when it was granted. */
export interface TaskListShare {
  userId: string;
  sharedAt: ISODateString;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/** Body for POST /task-lists */
export interface CreateTaskListDto {
  /** 1–255 characters */
  name: string;
}

/** Body for PUT /task-lists/:id */
export interface UpdateTaskListDto {
  /** 1–255 characters */
  name: string;
}

/** Body for POST /task-lists/:id/shares */
export interface AddShareDto {
  userId: string;
}

// ─── Response wrappers ────────────────────────────────────────────────────────

/**
 * Paginated list wrapper used by the GET /task-lists endpoint.
 * Sorted descending by createdAt as required by the spec.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Query parameters ─────────────────────────────────────────────────────────

/** Query params accepted by GET /task-lists */
export interface GetTaskListsParams {
  page?: number;
  pageSize?: number;
}

// ─── Internal types used by the HTTP layer ────────────────────────────────────

/** The header name the server expects for the caller's identity */
export const USER_ID_HEADER = 'X-User-Id' as const;
