import { Test, TestingModule } from '@nestjs/testing';
import { CurveService } from './curve.service';

describe('CurveService', () => {
  let service: CurveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurveService],
    }).compile();

    service = module.get<CurveService>(CurveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
