// ── Main provider ─────────────────────────────────────────────────────────────
export { HelsiApiProvider } from './providers';
export type { ApiConfigInput } from './providers';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  // Entities
  TaskList,
  TaskListSummary,
  TaskListShare,
  // DTOs
  CreateTaskListDto,
  UpdateTaskListDto,
  AddShareDto,
  // Query params
  GetTaskListsParams,
  // Response wrappers
  PaginatedResponse,
  // Misc
  ISODateString,
} from './types';

// ── Errors ────────────────────────────────────────────────────────────────────
export {
  HelsiApiError,
  ValidationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError,
  NetworkError,
} from './errors/api.errors';
export type { ApiErrorPayload } from './errors/api.errors';

// ── Low-level (advanced usage) ────────────────────────────────────────────────
export { HttpClient } from './http/http-client';
export type { RequestOptions } from './http/http-client';
export { ROUTES, USER_ID_HEADER } from './config/api.config';
