import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { Agent } from 'https';
import { ConfigModule } from '../config/config.module';
import { GroupModule } from '../group/group.module';
import { LightModule } from '../light/light.module';
import { HueController } from './hue.controller';
import { HueService } from './hue.service';
import { UpdateInterceptor } from './update.interceptor';

@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new Agent({
        rejectUnauthorized: false,
        keepAlive: true,
      }),
    }),
    ConfigModule,
    forwardRef(()=>LightModule),
    forwardRef(()=>GroupModule),
  ],
  controllers: [HueController],
  providers: [HueService, UpdateInterceptor],
  exports: [HueService, UpdateInterceptor],
})
export class HueModule {}
