import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LightModule } from '../light/light.module';
import { LightService } from '../light/light.service';
import { HueService } from './hue.service';
import { HueController } from './hue.controller';
import { GroupModule } from '../group/group.module';
import { ConfigModule } from '../config/config.module';
import { UpdateInterceptor } from './update.interceptor';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    forwardRef(() => LightModule),
    forwardRef(() => GroupModule),
  ],
  controllers: [HueController],
  providers: [HueService, LightService, UpdateInterceptor],
  exports: [HttpModule, HueService, GroupModule, LightService],
})
export class HueModule {}
