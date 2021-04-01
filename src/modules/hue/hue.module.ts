import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { LightModule } from '../light/light.module';
import { LightService } from '../light/light.service';
import { HueService } from './hue.service';
import { HueController } from './hue.controller';
import { GroupModule } from '../group/group.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [HttpModule, ConfigModule, forwardRef(()=>LightModule), forwardRef(()=>GroupModule)],
  controllers: [HueController],
  providers: [HueService, LightService],
  exports: [HttpModule, HueService, GroupModule, LightService],
})
export class HueModule {}
