import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthException } from '../auth/auth.exception';
import { TokenPayload } from '../auth/auth.interface';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../user/user.schema';
import { ReservationGuard } from './reservation.guard';

describe('ReservationGuard', () => {
  let guard: ReservationGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationGuard,
        {
          provide: AuthService,
          useValue: {
            readTokenPayload: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ReservationGuard>(ReservationGuard);
    authService = module.get<AuthService>(AuthService);
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = createMock<ExecutionContext>();
    });

    it('should throw AuthException if authorization header is missing', () => {
      (authService.readTokenPayload as jest.Mock).mockImplementation(() => {
        throw new AuthException('缺少授权信息');
      });

      expect(() => guard.canActivate(mockContext)).toThrow(AuthException);
      expect(() => guard.canActivate(mockContext)).toThrow('缺少授权信息');
    });

    it('should throw AuthException if authorization header is invalid format', () => {
      mockContext.getArgByIndex(2).req.headers.authorization = 'Invalid Format';
      (authService.readTokenPayload as jest.Mock).mockImplementation(() => {
        throw new AuthException('无效的 Token');
      });

      expect(() => guard.canActivate(mockContext)).toThrow(AuthException);
      expect(() => guard.canActivate(mockContext)).toThrow('无效的 Token');
    });

    it('should throw AuthException if token is invalid', () => {
      mockContext.getArgByIndex(2).req.headers.authorization =
        'Bearer invalid-token';
      (authService.readTokenPayload as jest.Mock).mockImplementation(() => {
        throw new AuthException('无效的 Token');
      });

      expect(() => guard.canActivate(mockContext)).toThrow(AuthException);
      expect(() => guard.canActivate(mockContext)).toThrow('无效的 Token');
    });

    it('should set tokenPayload on request object and return true if token is valid', () => {
      const token = 'valid-token';
      const decoded: TokenPayload = { userId: 'user-id', role: UserRole.GUEST };
      mockContext.getArgByIndex(2).req.headers.authorization =
        `Bearer ${token}`;
      (authService.readTokenPayload as jest.Mock).mockReturnValue(decoded);

      const canActivateResult = guard.canActivate(mockContext);

      expect(canActivateResult).toBe(true);
      expect(mockContext.getArgByIndex(2).req.tokenPayload).toEqual(decoded);
    });
  });
});
