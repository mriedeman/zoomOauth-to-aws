import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseLoggerService } from './database-logger.service';

describe('DatabaseLoggerService', () => {
  let service: DatabaseLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseLoggerService],
    }).compile();

    service = module.get<DatabaseLoggerService>(DatabaseLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
