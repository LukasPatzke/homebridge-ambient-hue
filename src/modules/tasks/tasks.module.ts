import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { HueModule } from '../hue/hue.module';
import { LightModule } from '../light/light.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [HueModule, ConfigModule, LightModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
