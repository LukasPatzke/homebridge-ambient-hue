import { Test, TestingModule } from '@nestjs/testing';
import { HueService } from './hue.service';

describe('HueService', () => {
  let service: HueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HueService],
    }).compile();

    service = module.get<HueService>(HueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
