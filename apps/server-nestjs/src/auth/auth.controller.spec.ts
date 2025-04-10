import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../user/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dtos/auth.response.dto';
import { AuthException } from './auth.exception';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      phone: '1361234431',
      password: 'password',
    };

    it('should register a new user and', async () => {
      const mockAuthResponse = new AuthResponseDto(
        'user-id',
        UserRole.GUEST,
        'mock-token',
      );

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw an error if registration fails', async () => {
      mockAuthService.register.mockRejectedValue(
        new AuthException('Registration failed'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Registration failed',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'test@example.com',
      password: 'password',
    };

    it('should login a user and return an auth response', async () => {
      const mockAuthResponse = new AuthResponseDto(
        'user-id',
        UserRole.GUEST,
        'mock-token',
      );

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw AuthException when login fails', async () => {
      mockAuthService.login.mockRejectedValue(
        new AuthException('Login failed'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow('Login failed');
    });
  });
});
