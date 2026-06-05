/**
 * Base class for every error thrown by the API provider.
 *
 * The .NET backend returns most failures as HTTP 400 with a plain-text message.
 * `buildErrorFromResponse` maps known messages to semantic subclasses so callers
 * can branch on `instanceof` instead of comparing strings.
 */
export declare class HelsiApiError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode: number, code?: string);
}
export declare class ValidationError extends HelsiApiError {
    constructor(message: string);
}
export declare class ForbiddenError extends HelsiApiError {
    constructor(message?: string);
}
export declare class NotFoundError extends HelsiApiError {
    constructor(message?: string);
}
export declare class ConflictError extends HelsiApiError {
    constructor(message?: string);
}
export declare class ServerError extends HelsiApiError {
    constructor(message?: string, statusCode?: number);
}
/** Timeout, connectivity loss, CORS block — request never reached the server */
export declare class NetworkError extends Error {
    readonly cause?: unknown;
    constructor(message: string, cause?: unknown);
}
export declare function buildErrorFromResponse(response: Response): Promise<HelsiApiError>;
//# sourceMappingURL=api.errors.d.ts.map