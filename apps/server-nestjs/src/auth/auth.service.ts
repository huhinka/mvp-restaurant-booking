import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { LoginDto } from '../user/dtos/login.dto';
import { RegisterDto } from '../user/dtos/register.dto';
import { User, UserDocument, UserRole } from '../user/user.schema';
import { AuthException } from './auth.exception';
import { TokenPayload } from './auth.interface';
import { AuthResponseDto } from './dtos/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 注册新用户（仅允许访客角色）
   *
   * @param registerDto 注册请求体
   * @returns Promise<AuthResponseDto>
   * @throws AuthException 如果用户已存在
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, phone, password } = registerDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      throw new AuthException('用户已存在');
    }

    const hashedPassword = await hash(password, 12);
    const newUser = await this.userModel.create({
      email,
      phone,
      password: hashedPassword,
      // 注册接口只能是访客，工作人员后台手动创建
      role: UserRole.GUEST,
    });

    const token = this.sign(newUser);

    return new AuthResponseDto(newUser._id.toString(), newUser.role, token);
  }

  /**
   * 用户登录
   *
   * @param loginDto 登录请求体
   * @returns Promise<AuthResponseDto>
   * @throws AuthException 如果用户名或密码错误
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { identifier, password } = loginDto;

    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user || !(await compare(password, user.password))) {
      throw new AuthException('用户名或密码错误');
    }

    const token = this.sign(user);

    return new AuthResponseDto(user._id.toString(), user.role, token);
  }

  private sign(user: UserDocument): string {
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    return this.jwtService.sign(tokenPayload);
  }

  readTokenPayload(authHeader: string): TokenPayload {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthException('缺少授权信息');
    }

    const token = authHeader.split(' ')[1];
    let decoded: TokenPayload;
    try {
      decoded = this.jwtService.verify(
        token,
        this.configService.get('JWT_SECRET'),
      );
    } catch (error) {
      const detail = error.message.includes('jwt expired')
        ? 'Token 已过期'
        : '无效的 Token';
      throw new AuthException(detail);
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  }
}
