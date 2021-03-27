import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { LightModule } from '../light/light.module';
import { LightService } from '../light/light.service';
import { HueService } from './hue.service';
import { HueController } from './hue.controller';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [HttpModule, forwardRef(()=>LightModule), GroupModule],
  controllers: [HueController],
  providers: [HueService, LightService],
  exports: [HttpModule, HueService, GroupModule, LightService],
})
export class HueModule {}
