import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { User, UserRole, UserSchema } from '../user/user.schema';
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
  let mongoServer: MongoMemoryServer;
  let module: TestingModule;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoServer.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
      ],
    }).compile();
  });

  afterAll(async () => {
    await mongoServer.stop();
    await module.close();
  });

  beforeEach(async () => {
    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));

    await userModel.deleteMany({});
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
      const result = await service.register(registerDto);

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result).toEqual({
        userId: expect.any(String),
        role: UserRole.GUEST,
        token: 'mock-token',
      });
    });

    it('should throw AuthException when conflict with email', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({
        _id: 'existing-user-id',
        email: registerDto.email,
        phone: 'other phone',
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        AuthException,
      );
    });

    it('should throw AuthException when conflict with phone', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({
        _id: 'existing-user-id',
        email: 'other email',
        phone: registerDto.phone,
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        AuthException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'test@example.com',
      password: 'password123',
    };

    it('should login a user', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({
        _id: 'user-id',
        email: loginDto.identifier,
        phone: 'other phone',
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
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
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(AuthException);
    });

    it('should throw AuthException when password is incorrect', async () => {
      const loginDto = {
        identifier: 'test@example.com',
        password: WRONG_PASSWORD,
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({
        _id: 'user-id',
        email: loginDto.identifier,
        phone: 'other phone',
        password: 'hashed-password',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn(),
      });

      await expect(service.login(loginDto)).rejects.toThrow(AuthException);
    });
  });
});
