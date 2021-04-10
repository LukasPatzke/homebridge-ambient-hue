import { Test, TestingModule } from '@nestjs/testing';
import { LightService } from './light.service';

describe('LightService', () => {
  let service: LightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightService],
    }).compile();

    service = module.get<LightService>(LightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
