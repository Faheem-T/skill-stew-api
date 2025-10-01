import { AppError } from "@skillstew/common";
import { PresentationErrorCodes } from "./PresentationErrorCodes";

export class PresentationError extends AppError {
  statusCode: number;
  constructor(code: keyof typeof PresentationErrorCodes, statusCode: number) {
    super(PresentationErrorCodes[code], code);
    this.statusCode = statusCode;
  }

  toJSON(): {
    message: string;
    error: string;
    errors?: { error: string; field?: string }[];
  } {
    return { error: this.code, message: this.message };
  }
}
