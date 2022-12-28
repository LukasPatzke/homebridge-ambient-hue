import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LightModule } from '../light/light.module';
import { LightService } from '../light/light.service';
import { HueService } from './hue.service';
import { HueController } from './hue.controller';
import { GroupModule } from '../group/group.module';
import { ConfigModule } from '../config/config.module';
import { UpdateInterceptor } from './update.interceptor';
import { Agent } from 'https';
import { CurveModule } from '../curve/curve.module';
import { PointModule } from '../point/point.module';

@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new Agent({
        rejectUnauthorized: false,
        keepAlive: true,
      }),
    }),
    ConfigModule,
    forwardRef(() => LightModule),
    forwardRef(() => GroupModule),
    forwardRef(() => CurveModule),
    forwardRef(() => PointModule),
  ],
  controllers: [HueController],
  providers: [HueService, LightService, UpdateInterceptor],
  exports: [HttpModule, HueService, GroupModule, LightService],
})
export class HueModule {}
