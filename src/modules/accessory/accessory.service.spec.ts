import { Test, TestingModule } from '@nestjs/testing';
import { AccessoryService } from './accessory.service';

describe('DeviceService', () => {
  let service: AccessoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessoryService],
    }).compile();

    service = module.get<AccessoryService>(AccessoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
