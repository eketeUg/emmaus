import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrayerService } from './prayer.service';
import { Prayer, PrayerSchema } from './prayer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prayer.name, schema: PrayerSchema }]),
  ],
  providers: [PrayerService],
  exports: [PrayerService],
})
export class PrayerModule {}
