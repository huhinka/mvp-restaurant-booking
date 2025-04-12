import { Field, InputType } from '@nestjs/graphql';
import { ReservationStatus } from '../entities/reservation.entity';

@InputType()
export class ReservationInput {
  @Field()
  guestName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  arrivalTime: string;

  @Field()
  tableSize: number;
}

@InputType()
export class ReservationUpdateInput {
  @Field({ nullable: true })
  guestName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  arrivalTime?: string;

  @Field({ nullable: true })
  tableSize?: number;
}

@InputType()
export class ReservationFilterInput {
  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  statuses?: ReservationStatus[];
}
