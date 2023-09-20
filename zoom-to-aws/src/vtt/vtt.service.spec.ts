import { Test, TestingModule } from '@nestjs/testing';
import { VttService } from './vtt.service';

describe('VttService', () => {
  let service: VttService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VttService],
    }).compile();

    service = module.get<VttService>(VttService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
