import { Module } from '@nestjs/common';
import { CheckinsService } from './checkins.service';

@Module({
  providers: [CheckinsService]
})
export class CheckinsModule {}
