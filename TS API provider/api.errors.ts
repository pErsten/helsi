// ─── Server error payload shape ───────────────────────────────────────────────

/**
 * Shape of the JSON error body returned by the .NET backend.
 * All fields are optional so we degrade gracefully when the body is empty
 * or not valid JSON.
 */
export interface ApiErrorPayload {
  /** Machine-readable code, e.g. "TASK_LIST_NOT_FOUND" */
  code?: string;
  /** Human-readable message */
  message?: string;
  /** Field-level validation errors keyed by property name */
  errors?: Record<string, string[]>;
  /** Distributed tracing id for server-side correlation */
  traceId?: string;
}

// ─── Base error ───────────────────────────────────────────────────────────────

/**
 * Base class for every error thrown by the API provider.
 *
 * Catch a `HelsiApiError` to handle any API-level failure in one place,
 * or narrow to a specific subclass for finer-grained control:
 *
 * ```ts
 * try {
 *   await api.taskLists.getById(id, userId);
 * } catch (err) {
 *   if (err instanceof NotFoundError) { ... }
 *   if (err instanceof ValidationError) { console.log(err.fieldErrors); }
 *   if (err instanceof HelsiApiError)   { console.log(err.statusCode); }
 * }
 * ```
 */
export class HelsiApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: Record<string, string[]>;
  public readonly traceId?: string;

  constructor(message: string, statusCode: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'HelsiApiError';
    this.statusCode = statusCode;
    this.code = payload?.code ?? 'UNKNOWN_ERROR';
    if (payload?.errors  !== undefined) this.errors  = payload.errors;
    if (payload?.traceId !== undefined) this.traceId = payload.traceId;
    // Restore correct prototype chain after TypeScript compilation
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Concrete subclasses ──────────────────────────────────────────────────────

/**
 * 400 Bad Request — name too long, missing required field, etc.
 */
export class ValidationError extends HelsiApiError {
  constructor(message: string, payload?: ApiErrorPayload) {
    super(message, 400, payload);
    this.name = 'ValidationError';
  }

  /**
   * Returns a flat array of human-readable field errors, e.g.:
   * ["name: Must be between 1 and 255 characters"]
   */
  get fieldErrors(): string[] {
    if (!this.errors) return [];
    return Object.entries(this.errors).flatMap(([field, msgs]) =>
      msgs.map((m) => `${field}: ${m}`),
    );
  }
}

/**
 * 403 Forbidden — the user exists but is not allowed to perform this action.
 * Example: trying to delete a list you don't own.
 */
export class ForbiddenError extends HelsiApiError {
  constructor(message = 'You do not have permission to perform this action', payload?: ApiErrorPayload) {
    super(message, 403, payload);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found — task list or share does not exist.
 */
export class NotFoundError extends HelsiApiError {
  constructor(message = 'The requested resource was not found', payload?: ApiErrorPayload) {
    super(message, 404, payload);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict — e.g. share already exists for this user.
 */
export class ConflictError extends HelsiApiError {
  constructor(message = 'Resource conflict', payload?: ApiErrorPayload) {
    super(message, 409, payload);
    this.name = 'ConflictError';
  }
}

/**
 * 5xx Server Error — unexpected backend failure.
 */
export class ServerError extends HelsiApiError {
  constructor(message = 'An unexpected server error occurred', statusCode = 500, payload?: ApiErrorPayload) {
    super(message, statusCode, payload);
    this.name = 'ServerError';
  }
}

/**
 * Network-level failure: timeout, no connectivity, CORS block, etc.
 * Does NOT have a statusCode — the request never reached the server.
 */
export class NetworkError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Builds the correct error subclass from a non-2xx Response.
 * Reads and parses the JSON body once; never throws during parsing.
 */
export async function buildErrorFromResponse(response: Response): Promise<HelsiApiError> {
  let payload: ApiErrorPayload = {};

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    // Body is empty or not JSON — use a sensible default message
  }

  const message = payload.message ?? response.statusText ?? `HTTP ${response.status}`;

  switch (response.status) {
    case 400:
      return new ValidationError(message, payload);
    case 403:
      return new ForbiddenError(message, payload);
    case 404:
      return new NotFoundError(message, payload);
    case 409:
      return new ConflictError(message, payload);
    default:
      return new ServerError(message, response.status, payload);
  }
}
