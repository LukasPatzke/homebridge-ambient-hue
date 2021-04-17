import { Test, TestingModule } from '@nestjs/testing';
import { LightController } from './light.controller';
import { LightService } from './light.service';

describe('LightController', () => {
  let controller: LightController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LightController],
      providers: [LightService],
    }).compile();

    controller = module.get<LightController>(LightController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
