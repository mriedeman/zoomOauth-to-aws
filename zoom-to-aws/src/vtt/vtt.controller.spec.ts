import { Test, TestingModule } from '@nestjs/testing';
import { VttController } from './vtt.controller';

describe('VttController', () => {
  let controller: VttController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VttController],
    }).compile();

    controller = module.get<VttController>(VttController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
