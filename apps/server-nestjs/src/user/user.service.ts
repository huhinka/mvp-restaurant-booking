import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as DataLoader from 'dataloader';

@Injectable()
export class UserService {
  private userLoader: DataLoader<string, UserDocument>;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.userLoader = new DataLoader<string, UserDocument>(
      this.batchUsers.bind(this),
    );
  }

  async batchUsers(userIds: string[]): Promise<UserDocument[]> {
    const users = await this.userModel.find({ _id: { $in: userIds } });
    const userMap: { [key: string]: UserDocument } = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user;
    });

    return userIds.map((id) => userMap[id]);
  }

  async findById(id: string): Promise<UserDocument> {
    return await this.userLoader.load(id);
  }
}
