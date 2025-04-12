import { UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { IncomingMessage } from 'http';
import { TokenPayload } from 'src/auth/auth.interface';
import { User, User as UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import {
  ReservationFilterInput,
  ReservationInput,
  ReservationUpdateInput,
} from './dtos/reservation-input.dto';
import {
  Reservation,
  ReservationPagination,
} from './entities/reservation.entity';
import { ReservationGuard, StaffGuard } from './reservation.guard';
import { ReservationService } from './reservation.service';

@Resolver(() => Reservation)
@UseGuards(ReservationGuard)
export class ReservationResolver {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly userService: UserService,
  ) {}

  @Query(() => ReservationPagination)
  async myReservations(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Context('req') req: IncomingMessage,
  ): Promise<ReservationPagination> {
    return await this.reservationService.findMyReservations(
      page,
      limit,
      this.parseUserId(req),
    );
  }

  @Query(() => ReservationPagination)
  @UseGuards(StaffGuard)
  async reservations(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('filter', { type: () => ReservationFilterInput, nullable: true })
    filter?: ReservationFilterInput,
  ): Promise<ReservationPagination> {
    return await this.reservationService.findReservations(page, limit, filter);
  }

  @Query(() => User)
  async me(@Context('req') req: IncomingMessage): Promise<UserDocument> {
    const userId = this.parseUserId(req);
    return await this.reservationService.me(userId);
  }

  @Mutation(() => Reservation)
  async createReservation(
    @Args('input') input: ReservationInput,
    @Context('req') req: IncomingMessage,
  ): Promise<Reservation> {
    const userId = this.parseUserId(req);
    return await this.reservationService.create(input, userId);
  }

  @Mutation(() => Reservation)
  async updateReservation(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ReservationUpdateInput,
    @Context('req') req: IncomingMessage,
  ): Promise<Reservation> {
    const userId = this.parseUserId(req);
    return await this.reservationService.update(id, input, userId);
  }

  @Mutation(() => Reservation)
  async cancelReservation(
    @Args('id', { type: () => ID }) id: string,
    @Args('reason') reason: string,
  ): Promise<Reservation> {
    return await this.reservationService.cancel(id, reason);
  }

  @Mutation(() => Reservation)
  @UseGuards(StaffGuard)
  async approveReservation(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Reservation> {
    return await this.reservationService.approve(id);
  }

  @Mutation(() => Reservation)
  @UseGuards(StaffGuard)
  async completeReservation(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Reservation> {
    return await this.reservationService.complete(id);
  }

  @ResolveField(() => User)
  async user(@Parent() reservation: Reservation): Promise<User> {
    return await this.userService.findById(reservation.user.toString());
  }

  /**
   * 从 Token Payload 解析用户 ID。
   *
   * @param req 附带有 Token Payload 的底层请求
   * @returns user ID
   * @see {@link AuthService}
   */
  private parseUserId(req: IncomingMessage): string {
    return (req['tokenPayload'] as TokenPayload).userId;
  }
}
