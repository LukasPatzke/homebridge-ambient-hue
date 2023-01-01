import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HueModule } from '../hue/hue.module';
import { Point } from './entities/point.entity';
import { PointController } from './point.controller';
import { PointService } from './point.service';

@Module({
  imports: [TypeOrmModule.forFeature([Point]), HueModule],
  controllers: [PointController],
  providers: [PointService],
  exports: [PointService],
})
export class PointModule {}
