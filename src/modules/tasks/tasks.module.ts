import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { HueModule } from '../hue/hue.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [HueModule, ConfigModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
