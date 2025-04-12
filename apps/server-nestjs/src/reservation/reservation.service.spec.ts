import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginateResult, Types } from 'mongoose';
import { AppException } from '../app.exception';
import { User, UserRole } from '../user/user.schema';
import { UserService } from '../user/user.service';
import {
  Reservation,
  ReservationDocument,
  ReservationPagination,
  ReservationStatus,
} from './entities/reservation.entity';
import { ReservationIllegalStateException } from './reservation.exception';
import { ReservationService } from './reservation.service';
import {
  ReservationInput,
  ReservationUpdateInput,
} from './dtos/reservation-input.dto';

describe('ReservationService', () => {
  let service: ReservationService;

  const mockUserService = {
    findById: jest.fn(),
    batchUsers: jest.fn(),
  };

  const mockReservationModel = {
    paginate: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  const guest = {
    _id: new Types.ObjectId(),
    email: 'guest@example.com',
    phone: '1361234431',
    password: 'hashed-password',
    role: UserRole.GUEST,
  } as User;

  const reservation = createMock<ReservationDocument>({
    _id: new Types.ObjectId(),
    user: guest._id,
    guestName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    arrivalTime: new Date(),
    tableSize: 2,
    status: ReservationStatus.REQUESTED,
  });
  const paginateResult = {
    docs: [reservation],
    totalDocs: 1,
    limit: 1,
    hasPrevPage: false,
    hasNextPage: false,
    totalPages: 1,
    offset: 0,
    pagingCounter: 1,
  } as PaginateResult<ReservationDocument>;
  const expectedResult = {
    items: paginateResult.docs,
    pageInfo: {
      totalItems: paginateResult.totalDocs,
      currentPage: paginateResult.page,
      itemsPerPage: paginateResult.limit,
      totalPages: paginateResult.totalPages,
      hasNextPage: paginateResult.hasNextPage,
    },
  } as ReservationPagination;

  describe('me', () => {
    it('should return user', async () => {
      mockUserService.findById.mockResolvedValue(guest);

      const result = await service.me(guest._id.toString());

      expect(result).toEqual(guest);
    });
  });

  describe('findMyReservations', () => {
    it('should return user reservations', async () => {
      mockReservationModel.paginate.mockResolvedValue(paginateResult);

      const result = await service.findMyReservations(
        1,
        10,
        guest._id.toString(),
      );

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findReservations', () => {
    it('should return reservations without filter', async () => {
      mockReservationModel.paginate.mockResolvedValue(paginateResult);

      const result = await service.findReservations(1, 10);

      expect(mockReservationModel.paginate).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return reservations with start date filter', async () => {
      const filter = { startDate: new Date('2023-10-01') };
      const query = { arrivalTime: { $gte: filter.startDate } };
      mockReservationModel.paginate.mockResolvedValue(paginateResult);

      const result = await service.findReservations(1, 10, filter);

      expect(mockReservationModel.paginate).toHaveBeenCalledWith(query, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return reservations with end date filter', async () => {
      const filter = { endDate: new Date('2023-10-31') };
      const query = { arrivalTime: { $lte: filter.endDate } };
      mockReservationModel.paginate.mockResolvedValue(paginateResult);

      const result = await service.findReservations(1, 10, filter);

      expect(mockReservationModel.paginate).toHaveBeenCalledWith(query, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return reservations with start and end date filters', async () => {
      const filter = {
        startDate: new Date('2023-10-01'),
        endDate: new Date('2023-10-31'),
      };
      const query = {
        arrivalTime: { $gte: filter.startDate, $lte: filter.endDate },
      };
      mockReservationModel.paginate.mockResolvedValue(paginateResult);

      const result = await service.findReservations(1, 10, filter);

      expect(mockReservationModel.paginate).toHaveBeenCalledWith(query, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return reservations with status filter', async () => {
      const filter = {
        statuses: [ReservationStatus.REQUESTED, ReservationStatus.APPROVED],
      };
      const query = { status: { $in: filter.statuses } };
      mockReservationModel.paginate.mockResolvedValue(paginateResult);

      const result = await service.findReservations(1, 10, filter);

      expect(mockReservationModel.paginate).toHaveBeenCalledWith(query, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return reservations with combined filters', async () => {
      const filter = {
        startDate: new Date('2023-10-01'),
        endDate: new Date('2023-10-31'),
        statuses: [ReservationStatus.REQUESTED, ReservationStatus.APPROVED],
      };
      const query = {
        arrivalTime: { $gte: filter.startDate, $lte: filter.endDate },
        status: { $in: filter.statuses },
      };
      mockReservationModel.paginate.mockResolvedValue(paginateResult);

      const result = await service.findReservations(1, 10, filter);

      expect(mockReservationModel.paginate).toHaveBeenCalledWith(query, {
        page: 1,
        limit: 10,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    const input = {
      guestName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      arrivalTime: new Date().toISOString(),
      tableSize: 2,
    } as ReservationInput;

    it('should throw an error if user does not exist', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.create(input, guest._id.toString())).rejects.toThrow(
        AppException,
      );
    });

    it('should create a reservation successfully', async () => {
      mockUserService.findById.mockResolvedValue(guest);
      mockReservationModel.create.mockResolvedValue(
        createMock<ReservationDocument>(),
      );

      const result = await service.create(input, guest._id.toString());

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should throw an error if reservation does not exist', async () => {
      mockReservationModel.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          'nonexistent-id',
          { guestName: 'John Doe' } as ReservationUpdateInput,
          guest._id.toString(),
        ),
      ).rejects.toThrow(ReservationIllegalStateException);
    });

    it('should throw an error if reservation status is not REQUESTED', async () => {
      const reservation = createMock<ReservationDocument>({
        status: ReservationStatus.APPROVED,
      });
      mockReservationModel.findById.mockResolvedValue(reservation);

      await expect(
        service.update(
          reservation._id.toString(),
          { guestName: 'John Doe' } as ReservationUpdateInput,
          guest._id.toString(),
        ),
      ).rejects.toThrow(AppException);
    });

    it('should update a reservation successfully', async () => {
      const reservation = createMock<ReservationDocument>({
        status: ReservationStatus.REQUESTED,
        guestName: 'John Doe',
        user: guest._id,
        save: jest.fn().mockReturnThis(),
      });
      mockReservationModel.findById.mockResolvedValue(reservation);

      const result = await service.update(
        reservation._id.toString(),
        { guestName: 'John Doe2' } as ReservationUpdateInput,
        guest._id.toString(),
      );

      expect(result.guestName).toBe('John Doe2');
    });
  });

  describe('cancel', () => {
    it('should throw an error if reservation does not exist', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      await expect(service.cancel('nonexistent-id', 'reason')).rejects.toThrow(
        ReservationIllegalStateException,
      );
    });

    it('should cancel a reservation successfully', async () => {
      mockReservationModel.findById.mockResolvedValue(reservation);

      const result = await service.cancel(reservation._id.toString(), 'reason');

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(result.cancellationReason).toBe('reason');
    });
  });

  describe('approve', () => {
    it('should throw an error if reservation does not exist', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      await expect(service.approve('nonexistent-id')).rejects.toThrow(
        ReservationIllegalStateException,
      );
    });

    it('should throw an error if status transition is invalid', async () => {
      const reservation = createMock<ReservationDocument>({
        status: ReservationStatus.CANCELLED,
      });
      mockReservationModel.findById.mockResolvedValue(reservation);

      await expect(service.approve(reservation._id.toString())).rejects.toThrow(
        AppException,
      );
    });

    it('should approve a reservation successfully', async () => {
      const reservation = createMock<ReservationDocument>({
        status: ReservationStatus.REQUESTED,
      });
      mockReservationModel.findById.mockResolvedValue(reservation);

      const result = await service.approve(reservation._id.toString());

      expect(result.status).toBe(ReservationStatus.APPROVED);
    });
  });

  describe('complete', () => {
    it('should throw an error if reservation does not exist', async () => {
      mockReservationModel.findById.mockResolvedValue(null);

      await expect(service.complete('nonexistent-id')).rejects.toThrow(
        ReservationIllegalStateException,
      );
    });

    it('should throw an error if status transition is invalid', async () => {
      const reservation = createMock<ReservationDocument>({
        status: ReservationStatus.CANCELLED,
      });
      mockReservationModel.findById.mockResolvedValue(reservation);

      await expect(
        service.complete(reservation._id.toString()),
      ).rejects.toThrow(AppException);
    });

    it('should complete a reservation successfully', async () => {
      const reservation = createMock<ReservationDocument>({
        status: ReservationStatus.APPROVED,
      });
      mockReservationModel.findById.mockResolvedValue(reservation);

      const result = await service.complete(reservation._id.toString());

      expect(result.status).toBe(ReservationStatus.COMPLETED);
    });
  });
});
