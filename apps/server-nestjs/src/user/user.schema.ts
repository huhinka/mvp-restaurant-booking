import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  GUEST = 'guest',
  STAFF = 'staff',
}

export type UserDocument = User & Document;

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => ID, { name: 'id' })
  _id: Types.ObjectId;

  @Field()
  @Prop({ required: true, unique: true })
  email: string;

  @Field()
  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Field()
  @Prop({ required: true, enum: UserRole, default: UserRole.GUEST })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
