import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { Reservation, ReservationSchema } from './entities/reservation.entity';
import { ReservationResolver } from './reservation.resolver';
import { ReservationService } from './reservation.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Reservation.name,
        useFactory: () => {
          const schema = ReservationSchema;
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          schema.plugin(require('mongoose-paginate-v2'));
          return schema;
        },
      },
    ]),
    AuthModule,
    UserModule,
  ],
  providers: [ReservationResolver, ReservationService],
})
export class ReservationModule {}
