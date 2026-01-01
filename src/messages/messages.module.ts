import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UsersModule } from 'src/users/users.module';
import { IntentsModule } from 'src/intents/intents.module';
import { HardMomentsModule } from 'src/hard-moments/hard-moments.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, UsersModule, IntentsModule, HardMomentsModule],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
