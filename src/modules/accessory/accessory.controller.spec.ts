import { Test, TestingModule } from '@nestjs/testing';
import { AccessoryController } from './accessory.controller';

describe('DeviceController', () => {
  let controller: AccessoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessoryController],
    }).compile();

    controller = module.get<AccessoryController>(AccessoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
