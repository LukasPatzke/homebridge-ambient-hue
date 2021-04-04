import { Module } from '@nestjs/common';
import { LightModule } from '../light/light.module';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
  imports: [LightModule],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
