import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PrayerService } from './prayer.service';
import { Prayer } from './prayer.schema';

describe('PrayerService', () => {
  let service: PrayerService;

  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'mock-key';
  });

  const mockPrayerModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrayerService,
        {
          provide: getModelToken(Prayer.name),
          useValue: mockPrayerModel,
        },
      ],
    }).compile();

    service = module.get<PrayerService>(PrayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
