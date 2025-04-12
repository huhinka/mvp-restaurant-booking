import { IsString } from 'class-validator';

export class LoginDto {
  /** 邮箱或手机号码 */
  @IsString()
  identifier: string;

  @IsString()
  password: string;
}
