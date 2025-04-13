import { UserRole } from '../user/user.schema';

export interface TokenPayload {
  userId: string;
  role: UserRole;
}
