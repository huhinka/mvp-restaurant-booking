import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenPayload } from '../auth/auth.interface';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../user/user.schema';

@Injectable()
export class ReservationGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.getArgByIndex(2).req;

    const tokenPayload = this.authService.readTokenPayload(
      req.headers.authorization,
    );

    req['tokenPayload'] = tokenPayload;

    return true;
  }
}

@Injectable()
export class StaffGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.getArgByIndex(2).req;

    const tokenPayload = req['tokenPayload'] as TokenPayload;
    return tokenPayload.role === UserRole.STAFF;
  }
}
