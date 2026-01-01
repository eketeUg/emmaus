import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { IntentsModule } from './intents/intents.module';
import { PrayerModule } from './prayer/prayer.module';
import { BibleModule } from './bible/bible.module';
import { CheckinsModule } from './checkins/checkins.module';
import { MemoryModule } from './memory/memory.module';
import { HardMomentsModule } from './hard-moments/hard-moments.module';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    MessagesModule,
    IntentsModule,
    PrayerModule,
    BibleModule,
    CheckinsModule,
    MemoryModule,
    HardMomentsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
