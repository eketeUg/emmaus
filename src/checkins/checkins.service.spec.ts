import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CheckinsService } from './checkins.service';
import { Checkin } from './checkins.schema';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';

describe('CheckinsService', () => {
  let service: CheckinsService;

  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'mock-key';
  });

  const mockCheckinModel = {
    create: jest.fn(),
  };
  const mockUsersService = {};
  const mockMessagesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckinsService,
        {
          provide: getModelToken(Checkin.name),
          useValue: mockCheckinModel,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
      ],
    }).compile();

    service = module.get<CheckinsService>(CheckinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
