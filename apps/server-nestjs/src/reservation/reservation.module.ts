import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from '../auth/auth.service';
import { User, UserSchema } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { Reservation, ReservationSchema } from './entities/reservation.entity';
import { ReservationResolver } from './reservation.resolver';
import { ReservationService } from './reservation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  providers: [
    ReservationResolver,
    ReservationService,
    UserService,
    AuthService,
  ],
})
export class ReservationModule {}
