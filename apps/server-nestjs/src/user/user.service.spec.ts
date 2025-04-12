import { createMock } from '@golevelup/ts-jest';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let module: TestingModule;

  const mockUserModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    const user: UserDocument = createMock<UserDocument>({
      _id: new Types.ObjectId(),
      email: 'test@example.com',
      phone: '1361234431',
      password: 'hashed-password',
      role: UserRole.GUEST,
    });
    const userId = user._id.toString();

    it('should return the user document for a valid user ID', async () => {
      mockUserModel.find.mockResolvedValue([user]);

      const result = await service.findById(userId);

      expect(result).toEqual(user);
    });

    it('should return null for an invalid user ID', async () => {
      mockUserModel.find.mockResolvedValue([]);

      const result = await service.findById('invalid-id');

      expect(result).toBeUndefined();
    });
  });

  describe('batchUsers', () => {
    const user1: UserDocument = createMock<UserDocument>({
      _id: new Types.ObjectId(),
      email: 'test1@example.com',
      phone: '1361234431',
      password: 'hashed-password',
      role: UserRole.GUEST,
    });
    const user2: UserDocument = createMock<UserDocument>({
      _id: new Types.ObjectId(),
      email: 'test2@example.com',
      phone: '1391234431',
      password: 'hashed-password',
      role: UserRole.GUEST,
    });
    const users: UserDocument[] = [user1, user2];
    const userIds = users.map((user) => user._id.toString());

    it('should return the user documents for valid user IDs', async () => {
      mockUserModel.find.mockResolvedValue(users);

      const result = await service.batchUsers(userIds);

      expect(result).toEqual(users);
    });

    it('should return an empty array for invalid user IDs', async () => {
      mockUserModel.find.mockResolvedValue([]);

      const result = await service.batchUsers(['invalid-id-1', 'invalid-id-2']);

      expect(result).toEqual([]);
    });

    it('should return partial user documents for mixed valid and invalid user IDs', async () => {
      mockUserModel.find.mockResolvedValue([users[0]]);

      const result = await service.batchUsers([...userIds, 'invalid-id']);

      expect(result).toEqual([users[0], undefined]);
    });
  });
});
