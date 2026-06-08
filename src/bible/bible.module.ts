import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BibleService } from './bible.service';

@Module({
  imports: [HttpModule],
  providers: [BibleService],
  exports: [BibleService],
})
export class BibleModule {}
