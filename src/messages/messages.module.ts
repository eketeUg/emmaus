import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UsersModule } from '../users/users.module';
import { IntentsModule } from '../intents/intents.module';
import { HardMomentsModule } from '../hard-moments/hard-moments.module';
import { HttpModule } from '@nestjs/axios';
import { MemoryModule } from '../memory/memory.module';
import { BibleModule } from '../bible/bible.module';
import { PrayerModule } from '../prayer/prayer.module';
import { CheckinsModule } from '../checkins/checkins.module';

@Module({
  imports: [
    HttpModule,
    UsersModule,
    IntentsModule,
    HardMomentsModule,
    MemoryModule,
    BibleModule,
    PrayerModule,
    forwardRef(() => CheckinsModule),
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
