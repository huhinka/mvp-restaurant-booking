import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult, Types } from 'mongoose';
import { AppException } from '../app.exception';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';
import {
  ReservationFilterInput,
  ReservationInput,
  ReservationUpdateInput,
} from './dtos/reservation-input.dto';
import {
  Reservation,
  ReservationDocument,
  ReservationPagination,
  ReservationStatus,
} from './entities/reservation.entity';
import { ReservationIllegalStateException } from './reservation.exception';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: PaginateModel<ReservationDocument>,
    private readonly userService: UserService,
  ) {}

  /**
   * 预约状态转移表。
   */
  private statusTransitionMap = {
    [ReservationStatus.REQUESTED]: [
      ReservationStatus.APPROVED,
      ReservationStatus.CANCELLED,
    ],
    [ReservationStatus.APPROVED]: [
      ReservationStatus.COMPLETED,
      ReservationStatus.CANCELLED,
    ],
    [ReservationStatus.CANCELLED]: [],
    [ReservationStatus.COMPLETED]: [],
  };

  async me(userId: string): Promise<User> {
    return await this.userService.findById(userId);
  }

  async findMyReservations(
    page: number,
    limit: number,
    userId: string,
  ): Promise<ReservationPagination> {
    const options = { page, limit };

    const result = (await this.reservationModel.paginate(
      {
        user: new Types.ObjectId(userId),
      },
      options,
    )) as PaginateResult<Reservation>;

    return this.convertPaginateResult(result);
  }

  async findReservations(
    page: number,
    limit: number,
    filter?: ReservationFilterInput,
  ): Promise<ReservationPagination> {
    const query: any = {};
    if (filter) {
      if (filter.startDate)
        query.arrivalTime = { ...query.arrivalTime, $gte: filter.startDate };
      if (filter.endDate)
        query.arrivalTime = { ...query.arrivalTime, $lte: filter.endDate };
      if (filter.statuses) query.status = { $in: filter.statuses };
    }
    const options = { page, limit };

    const result = (await this.reservationModel.paginate(
      query,
      options,
    )) as PaginateResult<Reservation>;

    return this.convertPaginateResult(result);
  }

  async create(input: ReservationInput, userId: string): Promise<Reservation> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new AppException('用户不存在', HttpStatus.UNAUTHORIZED);
    }

    const reservationData = {
      ...input,
      arrivalTime: new Date(input.arrivalTime),
      user,
    };
    const reservation = await this.reservationModel.create(reservationData);
    return reservation;
  }

  async update(
    id: string,
    input: ReservationUpdateInput,
    userId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationModel.findById({
      _id: id,
    });
    if (
      !reservation ||
      reservation.user.toString() !== userId ||
      reservation.status !== ReservationStatus.REQUESTED
    ) {
      throw new ReservationIllegalStateException();
    }

    const update = input.arrivalTime
      ? {
          ...input,
          arrivalTime: new Date(input.arrivalTime),
        }
      : input;
    Object.assign(reservation, update);
    return await reservation.save();
  }

  async cancel(id: string, reason: string): Promise<Reservation> {
    const reservation = await this.findAndUpdateStatus(
      id,
      ReservationStatus.CANCELLED,
    );
    reservation.cancellationReason = reason;
    await reservation.save();

    return reservation;
  }

  async approve(id: string): Promise<Reservation> {
    const reservation = await this.findAndUpdateStatus(
      id,
      ReservationStatus.APPROVED,
    );
    await reservation.save();

    return reservation;
  }

  async complete(id: string): Promise<Reservation> {
    const reservation = await this.findAndUpdateStatus(
      id,
      ReservationStatus.COMPLETED,
    );
    await reservation.save();

    return reservation;
  }

  /**
   * 查找并更新预约状态
   *
   * 注意：需要 save()
   *
   * @param id 预约 ID
   * @param newStatus 新状态
   * @returns 预约
   * @throws NotFoundException 如果预约不存在
   * @throws AppException 如果状态不正确
   */
  private async findAndUpdateStatus(
    id: string,
    newStatus: ReservationStatus,
  ): Promise<ReservationDocument> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new ReservationIllegalStateException();
    }

    if (!this.isValidStatusTransition(reservation.status, newStatus)) {
      throw new AppException(
        `无法从 ${reservation.status} 变更为 ${newStatus}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    reservation.status = newStatus;

    return reservation;
  }

  /**
   * 判断是否允许更新状态。
   *
   * @param currentStatus 当前状态
   * @param newStatus 新状态
   * @returns true 如果更新是合法的，否则返回false
   */
  private isValidStatusTransition(
    currentStatus: ReservationStatus,
    newStatus: ReservationStatus,
  ): boolean {
    return (
      this.statusTransitionMap[currentStatus]?.includes(newStatus) ?? false
    );
  }

  private convertPaginateResult(
    result: PaginateResult<Reservation>,
  ): ReservationPagination {
    return {
      items: result.docs,
      pageInfo: {
        totalItems: result.totalDocs,
        currentPage: result.page,
        itemsPerPage: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
      },
    };
  }
}
