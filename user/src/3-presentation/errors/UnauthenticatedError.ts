import { PresentationError } from "./PresentationError";

export class UnauthenticatedError extends PresentationError {
  constructor() {
    super("UNAUTHENTICATED_ERROR", 401);
  }
}
