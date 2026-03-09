# Error Handling in Clean Architecture

Error handling across multiple layers was one of the harder things to get right. This documents the approach I landed on.

## The Problem

Throwing JavaScript's base `Error` class everywhere leads to messy catch blocks — you end up with `if/else` chains checking error messages as strings, no way to distinguish a business rule violation from a database timeout, and no consistent response format for the frontend.

## Error Hierarchy

I extended the base `Error` class into two abstract base classes, each corresponding to a layer:

```
Error (JS built-in)
├── DomainError                — Business rule violations
│   ├── BlockedUserError
│   ├── SelfConnectionError
│   ├── InvalidCredentialsError
│   └── ...
└── AppError                   — Application / infrastructure errors
    ├── ValidationError
    ├── InfraError             — Infrastructure failures
    │   ├── DbQueryError
    │   ├── DbForeignKeyConstraintError
    │   └── ...
    └── TransientInfraError    — Retriable infra failures (retryable = true)
        ├── DbTimeoutError
        ├── ServiceUnavailableError
        └── ...
```

**DomainError** ([source](../user/src/domain/errors/DomainError.abstract.ts)) is for errors relating to business logic — things like a blocked user trying to log in, a user trying to connect with themselves, or invalid credentials.

**AppError** ([source](../user/src/application/errors/AppError.abstract.ts)) is for everything that's not strictly business logic — validation failures, auth token issues, and database problems. It includes a `retryable` flag to indicate whether the operation could succeed if retried.

**TransientInfraError** extends `AppError` with `retryable: true` for errors that are temporary by nature — like a database connection drop or an unavailable external service.

Both base classes share a common structure:

```ts
export abstract class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCodes,   // Enum-like error code
    message: string,
    public readonly cause?: Error,            // Error chaining
  ) { /* ... */ }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}
```

Key design decisions:
- **Error codes** (`DomainErrorCodes`, `AppErrorCodes`) — Each error has a typed code that uniquely identifies it, rather than relying on string messages.
- **Error chaining** via `cause` — When a repository catches a database error and throws an `AppError`, the original error is preserved in the chain for debugging.
- **`toJSON()`** — Every error knows how to serialize itself into a consistent response format.

## Error Code → HTTP Status Mapping

The domain and application layers know nothing about HTTP. The mapping from error codes to HTTP status codes happens **only in the presentation layer**:

```ts
// presentation/errors/ErrorCodeToStatusCodeMap.ts
export const ErrorCodeToStatusCodeMap: Record<AllErrorCodes, number> = {
  [DomainErrorCodes.BLOCKED_USER]:      HttpStatus.FORBIDDEN,
  [DomainErrorCodes.NOT_FOUND_ERROR]:   HttpStatus.NOT_FOUND,
  [DomainErrorCodes.INVALID_CREDENTIALS]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.VALIDATION_ERROR]:     HttpStatus.BAD_REQUEST,
  [AppErrorCodes.DB_CONNECTION_ERROR]:  HttpStatus.SERVICE_UNAVAILABLE,
  // ... all codes mapped exhaustively
};
```

`AllErrorCodes` is a union of `DomainErrorCodes` and `AppErrorCodes`, and the `Record` type ensures every error code has a mapping — adding a new error code without mapping it causes a compile-time error.

## Global Error Handler

A single Express middleware ([source](../user/src/presentation/middlewares/errorHandler.ts)) catches all errors and:

1. **Auto-converts Zod errors** to `ValidationError` instances (so Zod validation failures get the same treatment as any other error)
2. **Logs the full error chain** with request context (method, URL, user ID) using structured logging
3. **Maps to HTTP response** using the `ErrorCodeToStatusCodeMap`
4. **Falls back safely** for unknown errors — returns a generic message in production, the actual error message in development

## Consistent API Response Format

All error responses follow the same shape:

```json
{
  "success": false,
  "errors": [
    { "message": "Invalid credentials" },
    { "message": "Email is required", "field": "email" }
  ]
}
```

This was a deliberate decision to make frontend error handling uniform. The frontend can always expect the same structure regardless of whether the error was a domain validation, a Zod schema failure, or a database timeout. The optional `field` property allows the UI to display field-specific error messages next to the corresponding input.

## What I Learned

The whole approach — designing an error hierarchy that respects clean architecture boundaries, keeping HTTP concerns out of domain logic, exhaustive error code mapping, and error chaining for debuggability — was the learning. It took multiple iterations to get to something I was happy with, but the result is a system where adding a new error type is straightforward: create the error class, add its code, map it to a status code, and the rest of the infrastructure handles it automatically.
