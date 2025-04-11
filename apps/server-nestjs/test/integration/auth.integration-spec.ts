import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { AuthException } from 'server-nestjs/src/auth/auth.exception';
import { AuthService } from 'server-nestjs/src/auth/auth.service';
import { AuthResponseDto } from 'server-nestjs/src/auth/dtos/auth.response.dto';
import { User, UserRole, UserSchema } from 'server-nestjs/src/user/user.schema';

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

describe('AuthService (Integration)', () => {
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

      const userInDb = await userModel.findById(result.userId);
      expect(userInDb).toBeDefined();
      expect(userInDb.email).toBe(registerDto.email);
      expect(userInDb.phone).toBe(registerDto.phone);
      expect(userInDb.password).toBe('hashed-password');
      expect(userInDb.role).toBe(UserRole.GUEST);
    });

    it('should throw AuthException when conflict with email', async () => {
      await service.register(registerDto);

      const newRegisterDto = {
        ...registerDto,
        phone: '13611112222',
      };
      await expect(service.register(newRegisterDto)).rejects.toThrow(
        AuthException,
      );

      const usersInDb = await userModel.find({ email: registerDto.email });
      expect(usersInDb.length).toBe(1);
    });

    it('should throw AuthException when conflict with phone', async () => {
      await service.register(registerDto);

      const newRegisterDto = {
        ...registerDto,
        email: 'other@example.com',
      };
      await expect(service.register(newRegisterDto)).rejects.toThrow(
        AuthException,
      );

      const usersInDb = await userModel.find({ phone: registerDto.phone });
      expect(usersInDb.length).toBe(1);
    });
  });

  describe('login', () => {
    const registerDto = {
      email: 'test@example.com',
      phone: '1361234431',
      password: 'password123',
    };
    const loginByEmailDto = {
      identifier: registerDto.email,
      password: registerDto.password,
    };
    const loginByPhoneDto = {
      identifier: registerDto.email,
      password: registerDto.password,
    };

    it('should login a user by email', async () => {
      await service.register(registerDto);

      const result = await service.login(loginByEmailDto);

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result).toEqual({
        userId: expect.any(String),
        role: UserRole.GUEST,
        token: 'mock-token',
      });

      const userInDb = await userModel.findOne({
        email: loginByEmailDto.identifier,
      });
      expect(userInDb).toBeDefined();
    });

    it('should login a user by phone', async () => {
      await service.register(registerDto);

      const result = await service.login(loginByPhoneDto);

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result).toEqual({
        userId: expect.any(String),
        role: UserRole.GUEST,
        token: 'mock-token',
      });

      const userInDb = await userModel.findOne({
        email: loginByPhoneDto.identifier,
      });
      expect(userInDb).toBeDefined();
    });

    it('should throw AuthException when user not found', async () => {
      await expect(service.login(loginByEmailDto)).rejects.toThrow(
        AuthException,
      );

      const userInDb = await userModel.findOne({
        email: loginByEmailDto.identifier,
      });
      expect(userInDb).toBeNull();
    });

    it('should throw AuthException when password is incorrect', async () => {
      await service.register(registerDto);

      const loginDto = {
        ...loginByEmailDto,
        password: WRONG_PASSWORD,
      };
      await expect(service.login(loginDto)).rejects.toThrow(AuthException);
    });
  });
});
