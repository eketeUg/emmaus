import { Module } from '@nestjs/common';
import { BibleService } from './bible.service';

@Module({
  providers: [BibleService]
})
export class BibleModule {}
