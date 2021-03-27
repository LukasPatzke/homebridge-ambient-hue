import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from './point.controller';
import { PointService } from './point.service';

describe('PointController', () => {
  let controller: PointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [PointService],
    }).compile();

    controller = module.get<PointController>(PointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
