import { Module } from '@nestjs/common';
import { GroupModule } from '../group/group.module';
import { LightModule } from '../light/light.module';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
  imports: [LightModule, GroupModule],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
