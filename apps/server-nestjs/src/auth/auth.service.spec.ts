import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
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
  let userModel: Model<User>;
  let module: TestingModule;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
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
});
