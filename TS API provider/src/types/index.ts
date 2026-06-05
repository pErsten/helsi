// ─── Primitives ───────────────────────────────────────────────────────────────

/** ISO 8601 datetime string — e.g. "2025-08-20T10:30:00.000Z" */
export type ISODateString = string;

/** Header the .NET backend reads via HttpContext.GetUser() */
export const USER_ID_HEADER = 'X-User-Id' as const;

// ─── Enums (mirrors Domain.Enums.TaskListShareStatus) ─────────────────────────

export enum TaskListShareStatus {
  None = 0,
  Owner = 1,
  Shared = 2,
  Deleted = 3,
}

// ─── Response DTOs (mirrors C# Application/Domain DTOs) ───────────────────────

/** Returned by GET /TaskList/get */
export interface TaskListResponse {
  name: string;
  tasks: string;
}

/** Single entry returned by GET /TaskList/getByUser */
export interface TaskListByUser {
  taskListId: string;
  name: string;
}

/** Single entry returned by GET /TaskListShares/get */
export interface TaskListShareInfo {
  userId: string;
  status: TaskListShareStatus;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

/** Body + query for PUT /TaskList/create */
export interface CreateTaskListRequest {
  taskListName: string;
  /** Raw task-list content sent as a JSON string in the request body */
  tasks: string;
}

/** Query + body for PATCH /TaskList/update */
export interface UpdateTaskListRequest {
  taskListId: string;
  newTaskListName: string;
  /** Raw task-list content sent as a JSON string in the request body */
  newTasks: string;
}

/** Query params for GET /TaskList/getByUser */
export interface GetTaskListsByUserParams {
  /** Zero-based page index (server validates page >= 0) */
  page?: number;
  pageSize?: number;
}

// ─── Validation limits (mirrors Domain.Constants) ─────────────────────────────

export const TASK_LIST_NAME_MIN_LENGTH = 1;
export const TASK_LIST_NAME_MAX_LENGTH = 255;
export const TASK_LIST_PAGE_SIZE_MIN = 1;
export const TASK_LIST_PAGE_SIZE_MAX = 100;
