import { Module } from '@nestjs/common';
import { HardMomentsService } from './hard-moments.service';

@Module({
  providers: [HardMomentsService],
  exports: [HardMomentsService],
})
export class HardMomentsModule {}
