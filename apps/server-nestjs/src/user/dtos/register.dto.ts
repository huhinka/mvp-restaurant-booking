import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber('CN')
  phone: string;

  @IsString()
  // 与 server 项目保持一致
  @MinLength(8, { message: '密码长度不能小于8位' })
  password: string;
}
