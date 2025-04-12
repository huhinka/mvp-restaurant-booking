import { UserRole } from 'src/user/user.schema';

export interface TokenPayload {
  userId: string;
  role: UserRole;
}
