import { forwardRef, Module } from '@nestjs/common';
import { GroupModule } from '../group/group.module';
import { HueModule } from '../hue/hue.module';
import { LightModule } from '../light/light.module';
import { AccessoryGateway } from './accesory.gateway';
import { AccessoryController } from './accessory.controller';
import { AccessoryService } from './accessory.service';

@Module({
  imports: [
    forwardRef(() => LightModule),
    GroupModule,
    HueModule,
  ],
  controllers: [AccessoryController],
  providers: [AccessoryService, AccessoryGateway],
  exports: [AccessoryGateway],
})
export class AccessoryModule {}
