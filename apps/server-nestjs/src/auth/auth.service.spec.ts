import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from '../user/user.schema';
import { AuthException } from './auth.exception';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dtos/auth.response.dto';

const WRONG_PASSWORD = 'wrong-password';
jest.mock('bcrypt', () => ({
  // 减少单测执行时间，bcrypt 哈希是 CPU 密集型任务
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn((password) => {
    if (password === WRONG_PASSWORD) {
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      phone: '1361234431',
      password: 'password123',
    };

    it('should register a new user', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.create.mockResolvedValueOnce({
        _id: 'user-id',
        email: registerDto.email,
        phone: registerDto.phone,
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result).toEqual({
        userId: 'user-id',
        role: UserRole.GUEST,
        token: 'mock-token',
      });
    });

    it('should throw AuthException when conflict with email', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'existing-user-id',
        email: registerDto.email,
        phone: 'other phone',
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
      });

      try {
        await service.register(registerDto);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('用户已存在');
      }
    });

    it('should throw AuthException when conflict with phone', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'existing-user-id',
        email: 'other email',
        phone: registerDto.phone,
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await service.register(registerDto);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('用户已存在');
      }
    });
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'test@example.com',
      password: 'password123',
    };

    it('should login a user', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'user-id',
        email: loginDto.identifier,
        phone: 'other phone',
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.login(loginDto);

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result).toEqual({
        userId: 'user-id',
        role: UserRole.GUEST,
        token: 'mock-token',
      });
    });

    it('should throw AuthException when user not found', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);

      try {
        await service.login(loginDto);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('用户名或密码错误');
      }
    });

    it('should throw AuthException when password is incorrect', async () => {
      const loginDto = {
        identifier: 'test@example.com',
        password: WRONG_PASSWORD,
      };

      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'user-id',
        email: loginDto.identifier,
        phone: 'other phone',
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        await service.login(loginDto);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('用户名或密码错误');
      }
    });
  });

  describe('readTokenPayload', () => {
    const validToken = 'valid-token';
    const expiredToken = 'expired-token';
    const invalidToken = 'invalid-token';

    beforeEach(() => {
      // Mock JWT service methods
      mockJwtService.verify.mockImplementation((token) => {
        if (token === validToken) {
          return { userId: 'user-id', role: UserRole.GUEST };
        } else if (token === expiredToken) {
          throw new Error('jwt expired');
        } else {
          throw new Error('invalid signature');
        }
      });
    });

    it('should return the token payload for a valid Bearer token', () => {
      const authHeader = `Bearer ${validToken}`;
      const result = service.readTokenPayload(authHeader);

      expect(result).toEqual({
        userId: 'user-id',
        role: UserRole.GUEST,
      });
    });

    it('should throw AuthException with "无效的 Token" for an invalid Bearer token', () => {
      const authHeader = `Bearer ${invalidToken}`;

      try {
        service.readTokenPayload(authHeader);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('无效的 Token');
      }
    });

    it('should throw AuthException with "Token 已过期" for an expired Bearer token', () => {
      const authHeader = `Bearer ${expiredToken}`;

      try {
        service.readTokenPayload(authHeader);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('Token 已过期');
      }
    });

    it('should throw AuthException with "缺少授权信息" for a non-Bearer token', () => {
      const authHeader = `Invalid ${validToken}`;

      try {
        service.readTokenPayload(authHeader);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('缺少授权信息');
      }
    });

    it('should throw AuthException with "缺少授权信息" for an empty string', () => {
      const authHeader = '';

      try {
        service.readTokenPayload(authHeader);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('缺少授权信息');
      }
    });

    it('should throw AuthException with "缺少授权信息" for undefined', () => {
      const authHeader = undefined;

      try {
        service.readTokenPayload(authHeader);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect(error.message).toBe('缺少授权信息');
      }
    });
  });
});
