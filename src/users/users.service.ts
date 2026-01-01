import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async findOrCreate(whatsappId: string): Promise<UserDocument> {
    let user = await this.userModel.findOne({ whatsappId });

    if (!user) {
      user = await this.userModel.create({ whatsappId });
    }

    return user;
  }
}
