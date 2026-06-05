// ─── Known server messages (mirrors Domain.Constants) ─────────────────────────
const SERVER_MESSAGES = {
    taskListAlreadyExists: 'TaskList already exists',
    taskListForbiddenOrNotFound: 'TaskList or not found or user has no access to it',
    taskListSharesForbidden: 'TaskList shares user has no access',
    taskListNotFound: 'TaskList not found',
    taskListSharesNotFound: 'TaskList shares not found',
    taskListShareAlreadyExists: 'TaskList share already exists',
    taskListShareNotFound: 'TaskList share not found',
    taskListShareStatusNotShared: 'TaskList share status not shared',
    taskListShareOwnerAndSharedUserSame: 'TaskList share owner and shared user are the same',
    taskListShareCannotUnshareAnother: 'TaskList share user cannot unshare another sharer',
};
// ─── Base error ───────────────────────────────────────────────────────────────
/**
 * Base class for every error thrown by the API provider.
 *
 * The .NET backend returns most failures as HTTP 400 with a plain-text message.
 * `buildErrorFromResponse` maps known messages to semantic subclasses so callers
 * can branch on `instanceof` instead of comparing strings.
 */
export class HelsiApiError extends Error {
    constructor(message, statusCode, code = 'UNKNOWN_ERROR') {
        super(message);
        this.name = 'HelsiApiError';
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class ValidationError extends HelsiApiError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
export class ForbiddenError extends HelsiApiError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 400, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}
export class NotFoundError extends HelsiApiError {
    constructor(message = 'The requested resource was not found') {
        super(message, 400, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
export class ConflictError extends HelsiApiError {
    constructor(message = 'Resource conflict') {
        super(message, 400, 'CONFLICT');
        this.name = 'ConflictError';
    }
}
export class ServerError extends HelsiApiError {
    constructor(message = 'An unexpected server error occurred', statusCode = 500) {
        super(message, statusCode, 'SERVER_ERROR');
        this.name = 'ServerError';
    }
}
/** Timeout, connectivity loss, CORS block — request never reached the server */
export class NetworkError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'NetworkError';
        this.cause = cause;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
// ─── Response parsing ─────────────────────────────────────────────────────────
async function readErrorMessage(response) {
    const text = await response.text();
    if (!text)
        return response.statusText || `HTTP ${response.status}`;
    try {
        const parsed = JSON.parse(text);
        if (typeof parsed === 'string')
            return parsed;
        if (parsed !== null &&
            typeof parsed === 'object' &&
            'message' in parsed &&
            typeof parsed.message === 'string') {
            return parsed.message;
        }
    }
    catch {
        // Body is plain text, not JSON
    }
    return text;
}
function mapMessageToError(message, statusCode) {
    switch (message) {
        case SERVER_MESSAGES.taskListNotFound:
        case SERVER_MESSAGES.taskListSharesNotFound:
        case SERVER_MESSAGES.taskListShareNotFound:
            return new NotFoundError(message);
        case SERVER_MESSAGES.taskListForbiddenOrNotFound:
        case SERVER_MESSAGES.taskListSharesForbidden:
        case SERVER_MESSAGES.taskListShareCannotUnshareAnother:
            return new ForbiddenError(message);
        case SERVER_MESSAGES.taskListAlreadyExists:
        case SERVER_MESSAGES.taskListShareAlreadyExists:
            return new ConflictError(message);
        default:
            if (statusCode >= 500)
                return new ServerError(message, statusCode);
            if (statusCode === 400)
                return new ValidationError(message);
            return new HelsiApiError(message, statusCode);
    }
}
export async function buildErrorFromResponse(response) {
    const message = await readErrorMessage(response);
    return mapMessageToError(message, response.status);
}
//# sourceMappingURL=api.errors.js.map