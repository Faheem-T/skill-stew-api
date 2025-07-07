import { PresentationError } from "./PresentationError";

export class ForbiddenError extends PresentationError {
  constructor() {
    super("FORBIDDEN_ERROR", 403);
  }
}
