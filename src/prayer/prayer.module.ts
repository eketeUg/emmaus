import { Module } from '@nestjs/common';
import { PrayerService } from './prayer.service';

@Module({
  providers: [PrayerService]
})
export class PrayerModule {}
