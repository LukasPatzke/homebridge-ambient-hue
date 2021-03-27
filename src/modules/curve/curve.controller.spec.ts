import { Test, TestingModule } from '@nestjs/testing';
import { CurveController } from './curve.controller';
import { CurveService } from './curve.service';

describe('CurveController', () => {
  let controller: CurveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurveController],
      providers: [CurveService],
    }).compile();

    controller = module.get<CurveController>(CurveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
