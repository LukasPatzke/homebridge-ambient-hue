import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { HueModule } from '../hue/hue.module';

@Module({
  imports: [HueModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
