import { Test, TestingModule } from '@nestjs/testing';
import { AccessoryGateway } from './accesorygateway';

describe('AccessoryGateway', () => {
  let gateway: AccessoryGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessoryGateway],
    }).compile();

    gateway = module.get<AccessoryGateway>(AccessoryGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
