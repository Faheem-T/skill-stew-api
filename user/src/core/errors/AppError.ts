export abstract class AppError extends Error {
  public readonly name: string;
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract toJSON(): object;
}

export abstract class DomainError extends AppError {}

export abstract class InfrastructureError extends AppError {}

export abstract class ApplicationError extends AppError {}
