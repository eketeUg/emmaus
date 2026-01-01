import { Test, TestingModule } from '@nestjs/testing';
import { HardMomentsService } from './hard-moments.service';

describe('HardMomentsService', () => {
  let service: HardMomentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HardMomentsService],
    }).compile();

    service = module.get<HardMomentsService>(HardMomentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
