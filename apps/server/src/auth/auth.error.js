import { AppError } from "../infrastructure/error.js";

export class AuthError extends AppError {
  constructor(message, code = 401) {
    super(message, code);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super("Forbidden", 403);
  }
}
