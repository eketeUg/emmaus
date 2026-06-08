import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { BibleService } from './bible.service';

describe('BibleService', () => {
  let service: BibleService;

  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'mock-key';
  });

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BibleService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<BibleService>(BibleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
