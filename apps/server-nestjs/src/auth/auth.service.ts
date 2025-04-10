import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { LoginDto } from '../user/dtos/login.dto';
import { RegisterDto } from '../user/dtos/register.dto';
import { User, UserRole } from '../user/user.schema';
import { AuthException } from './auth.exception';
import { AuthResponseDto } from './dtos/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
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
    const newUser = new this.userModel({
      email,
      phone,
      password: hashedPassword,
      // 注册接口只能是访客，工作人员后台手动创建
      role: UserRole.GUEST,
    });
    const savedUser = await newUser.save();

    const token = this.jwtService.sign({
      id: savedUser._id,
      role: savedUser.role,
    });

    return new AuthResponseDto(savedUser._id.toString(), savedUser.role, token);
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

    const token = this.jwtService.sign({
      id: user._id,
      role: user.role,
    });

    return new AuthResponseDto(user._id.toString(), user.role, token);
  }
}
