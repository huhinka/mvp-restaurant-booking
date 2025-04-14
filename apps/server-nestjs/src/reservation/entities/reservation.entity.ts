import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/user.schema';

export enum ReservationStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

registerEnumType(ReservationStatus, {
  name: 'ReservationStatus',
});

export type ReservationDocument = Reservation & Document;

@ObjectType()
@Schema({ timestamps: true })
export class Reservation {
  @Field(() => ID, { name: 'id' })
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  guestName: string;

  @Field()
  @Prop({
    required: true,
    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
  })
  email: string;

  @Field()
  @Prop({ required: true, match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/ })
  phone: string;

  @Field()
  @Prop({ required: true })
  arrivalTime: Date;

  @Field()
  @Prop({ required: true, min: 1 })
  tableSize: number;

  @Field(() => ReservationStatus)
  @Prop({ enum: ReservationStatus, default: ReservationStatus.REQUESTED })
  status: ReservationStatus;

  @Field(() => User)
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Field({ nullable: true })
  @Prop()
  cancellationReason?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

@ObjectType()
export class PageInfo {
  @Field()
  totalItems: number;

  @Field()
  currentPage: number;

  @Field()
  itemsPerPage: number;

  @Field()
  totalPages: number;

  @Field()
  hasNextPage: boolean;
}

@ObjectType()
export class ReservationPagination {
  @Field(() => [Reservation])
  items: Reservation[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
