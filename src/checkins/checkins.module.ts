import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckinsService } from './checkins.service';
import { Checkin, CheckinSchema } from './checkins.schema';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Checkin.name, schema: CheckinSchema }]),
    UsersModule,
    forwardRef(() => MessagesModule),
  ],
  providers: [CheckinsService],
  exports: [CheckinsService],
})
export class CheckinsModule {}
