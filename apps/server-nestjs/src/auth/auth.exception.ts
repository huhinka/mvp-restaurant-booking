import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class AuthException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
