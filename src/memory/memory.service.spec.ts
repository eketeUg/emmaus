import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MemoryService } from './memory.service';
import { Memory } from './memory.schema';

describe('MemoryService', () => {
  let service: MemoryService;

  const mockMemoryModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        {
          provide: getModelToken(Memory.name),
          useValue: mockMemoryModel,
        },
      ],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
