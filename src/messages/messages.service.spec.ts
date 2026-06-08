import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { IntentsService } from '../intents/intents.service';
import { HardMomentsService } from '../hard-moments/hard-moments.service';
import { MemoryService } from '../memory/memory.service';
import { BibleService } from '../bible/bible.service';
import { PrayerService } from '../prayer/prayer.service';
import { CheckinsService } from '../checkins/checkins.service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'mock-key';
  });

  const mockUsersService = {};
  const mockIntentsService = {};
  const mockHardMomentsService = {};
  const mockMemoryService = {};
  const mockBibleService = {};
  const mockPrayerService = {};
  const mockCheckinsService = {};
  const mockHttpService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: IntentsService, useValue: mockIntentsService },
        { provide: HardMomentsService, useValue: mockHardMomentsService },
        { provide: MemoryService, useValue: mockMemoryService },
        { provide: BibleService, useValue: mockBibleService },
        { provide: PrayerService, useValue: mockPrayerService },
        { provide: CheckinsService, useValue: mockCheckinsService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
