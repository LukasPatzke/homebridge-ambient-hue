import { Test, TestingModule } from '@nestjs/testing';
import { LightGateway } from './light.gateway';

describe('LightGateway', () => {
  let gateway: LightGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightGateway],
    }).compile();

    gateway = module.get<LightGateway>(LightGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
