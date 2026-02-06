# SkillStew API - Agent Development Guidelines

This document provides guidelines for agentic coding agents working in this microservices-based Node.js/TypeScript API repository.

## Architecture Overview

This is a microservices architecture with the following services:
- `user/` - User management, authentication, profiles (PostgreSQL + Drizzle ORM)
- `skill/` - Skill management (MongoDB + Mongoose)
- `payments/` - Subscription plans (PostgreSQL + Drizzle ORM)
- `gateway/` - API Gateway with JWT authentication
- `es-proxy/` - Elasticsearch proxy service
- `common/` - Shared utilities and types

## Build/Development Commands

### Service Development
Each service runs independently with watch mode:

```bash
# User service (with database sync)
cd user && npm start                    # Starts with tsx watch
cd user && npm run syncDb              # Drizzle database schema push
cd user && npm test                    # Run Jest tests

# Skill service (with data seeding)
cd skill && npm start                  # Starts with Bun watch
cd skill && npm run seed               # Seed skill data

# Payments service
cd payments && npm start               # Starts with tsx watch
cd payments && npm run syncDb          # Drizzle database schema push

# Gateway service
cd gateway && npm start                # Starts with tsx watch

# ES Proxy service
cd es-proxy && npm start               # Starts with tsx watch
```

### Common Package
```bash
cd common && npm run build             # TypeScript compilation
cd common && npm run pub              # Version bump and publish
```

### Testing
- Only the `user` service has Jest configured currently
- Test command: `cd user && npm test`
- Single test: `cd user && npx jest path/to/test.test.ts`
- Tests are located in `src/__tests__/` directories

### Project-wide
```bash
# Git hooks setup
npm run prepare                        # Installs husky

# Commit linting
npm run commitlint                     # Lints commit messages
```

## Code Style Guidelines

### TypeScript Configuration
- ESNext target with strict mode enabled
- Node.js runtime environment
- ES modules (`"type": "module"` in package.json)
- No explicit `any` types allowed
- Use `bun` for skill service, `tsx` for others

### Import Organization
```typescript
// External libraries first
import express from "express";
import { z } from "zod";
import cors from "cors";

// Internal modules (absolute paths from service root)
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { UserRoles } from "./domain/entities/UserRoles";
import { authController } from "../../di";
```

### File Naming Conventions
- `PascalCase.ts` for classes, entities, interfaces, types
- `camelCase.ts` for utilities, services, mappers
- `kebab-case.ts` for configuration files
- Files ending with `.abstract.ts` for abstract classes
- Files ending with `.enum.ts` for enums
- Test files: `*.test.ts` or `*.spec.ts` in `__tests__/` directories

### Directory Structure (Clean Architecture)
```
src/
├── domain/                 # Business logic
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   └── errors/           # Domain errors
├── infrastructure/         # External concerns
│   ├── db/               # Database schemas, configs
│   ├── repositories/     # Repository implementations
│   ├── services/         # External services (email, storage, etc.)
│   └── mappers/          # Data transformation
├── application/           # Use cases (es-proxy service)
├── presentation/          # API layer
│   ├── controllers/      # Request handlers
│   ├── routers/          # Express routes
│   ├── middlewares/      # Express middlewares
│   └── errors/           # Error mapping
├── utils/                 # Shared utilities
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
└── di/                   # Dependency injection
```

### Entity & Class Definitions
```typescript
// Domain entity with constructor properties
export class User {
  constructor(
    public id: string,
    public email: string,
    public role: UserRoles,
    public isVerified: boolean,
    public isBlocked: boolean,
    public isGoogleLogin: boolean,
    public username?: string,
    public passwordHash?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
```

### Error Handling

The user service implements a comprehensive three-layer error handling architecture:

#### Error Classification
- **Domain Errors** (`domain/errors/`): Business logic violations (InvalidCredentials, NotFound, BlockedUser, etc.)
- **Application Errors** (`application/errors/`): Infrastructure and technical errors (ValidationError, Database errors, Auth errors)

#### Error Hierarchy
```typescript
// Domain Error Abstract Base Class
export abstract class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCodes,
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    if (cause?.stack && this.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}

// Application Error Abstract Base Class (includes retryable flag)
export abstract class AppError extends Error {
  constructor(
    public readonly code: AppErrorCodes,
    message: string,
    public readonly cause?: Error,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    if (cause?.stack && this.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}

// Specific Domain Error Implementation
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(DomainErrorCodes.INVALID_CREDENTIALS, "Invalid credentials.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}

// Validation Error (Application Error)
export class ValidationError extends AppError {
  public readonly errors: Array<{ message: string; field?: string }>;

  constructor(
    errors: Array<{ message: string; field?: string }>,
    error?: Error,
  ) {
    super(AppErrorCodes.VALIDATION_ERROR, "Validation Error", error, false);
    this.errors = errors;
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: this.errors };
  }
}
```

#### Centralized Error Management
```typescript
// Error Code Consolidation
export const AllErrorCodes = {
  ...DomainErrorCodes,
  ...AppErrorCodes,
};

// HTTP Status Code Mapping
export const ErrorCodeToStatusCodeMap: Record<AllErrorCodes, number> = {
  [DomainErrorCodes.INVALID_CREDENTIALS]: HttpStatus.BAD_REQUEST,
  [DomainErrorCodes.NOT_FOUND_ERROR]: HttpStatus.NOT_FOUND,
  [DomainErrorCodes.BLOCKED_USER]: HttpStatus.FORBIDDEN,
  [AppErrorCodes.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.DB_CONNECTION_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
  // ... etc
};
```

#### Global Error Handler
```typescript
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Auto-map Zod validation errors
  if (error instanceof ZodError) {
    error = mapZodErrorToValidationError(error);
  }

  // Extract full error chain for logging
  const errorChain = getFullErrorChain(error);

  // Structured logging with request context
  logger.error({
    message: "Application error occurred",
    error: { name: error.name, message: error.message, code: error.code, chain: errorChain },
    request: { method: req.method, url: req.url, userId: req.headers["x-user-id"] },
  });

  // Map to HTTP response
  if (error instanceof DomainError || error instanceof AppError) {
    const statusCode = ErrorCodeToStatusCodeMap[error.code];
    res.status(statusCode).json({ ...error.toJSON(), success: false });
  } else {
    // Unknown errors get generic response (except in development)
    res.status(500).json({
      success: false,
      errors: [{ message: process.env.NODE_ENV === "development" ? error.message : "An unexpected error occurred" }],
    });
  }
};
```

#### Key Principles
- **Error Chaining**: Use `cause` parameter to preserve error context
- **Field-Specific Validation**: Validation errors include field paths for UI feedback
- **Environment-Aware**: Detailed messages in development, safe messages in production
- **Consistent Response Format**: Always `{ success: boolean, errors: Array<{message, field?}> }`
- **Structured Logging**: Include request context and full error chain

### Database Patterns

#### PostgreSQL (Drizzle ORM)
```typescript
// Schema definition
export const userTable = pgTable("users", {
  id: uuid().primaryKey().$default(() => randomUUID()),
  email: text().unique().notNull(),
  role: roleEnum("role").notNull(),
  is_verified: boolean().default(false).notNull(),
  ...timestamps,
});

// Repository pattern
export class UserRepository implements IUserRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);
    
    return result[0] ? this.mapper.toDomain(result[0]) : null;
  }
}
```

#### MongoDB (Mongoose)
```typescript
// Model definition
export const SkillModel = new mongoose.model<Skill>("Skill", skillSchema);

// Repository pattern
export class SkillRepository implements ISkillRepository {
  async findById(id: string): Promise<Skill | null> {
    return await SkillModel.findById(id).exec();
  }
}
```

### API Controllers & Routing
```typescript
// Router structure
const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.login);

export default router;

// App setup
app.use("/api/v1/auth", authRouter);
app.use(errorHandler);
```

### Dependency Injection
Use container-based DI pattern:
```typescript
// di/index.ts
export const authController = new AuthController(
  userService,
  jwtService,
  emailService
);
```

### Logging
Use Winston for structured logging:
```typescript
import { logger } from "./utils/logger";

logger.info("User registered successfully", { userId: user.id });
logger.error("Database connection failed", { error: error.message });
```

### Environment Configuration
Use dotenv with typed configuration:
```typescript
// utils/dotenv.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "3000"),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
} as const;
```

### Validation
Use Zod for schema validation:
```typescript
const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});
```

## Development Workflow

1. **Always work from service directory** - Each service is independent
2. **Use TypeScript strict mode** - All files must pass type checking
3. **Follow existing patterns** - Mirror existing code structure and conventions
4. **Test in isolation** - Services run independently on different ports
5. **Database migrations** - Use `syncDb` commands for schema changes
6. **Commit messages** - Follow conventional commits (enforced by commitlint)

## Port Allocation (Development)
- Gateway: 3000
- User Service: 3001
- Skill Service: 3002
- Payments Service: 3003
- ES Proxy: 3004

## Technology Stack Summary
- **Runtime**: Node.js with tsx (skill service uses Bun)
- **Database**: PostgreSQL (user, payments), MongoDB (skill)
- **ORM**: Drizzle ORM (PostgreSQL), Mongoose (MongoDB)
- **Testing**: Jest (user service only currently)
- **Message Queue**: RabbitMQ (amqplib)
- **Search**: Elasticsearch
- **Storage**: AWS S3
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schemas
- **Logging**: Winston