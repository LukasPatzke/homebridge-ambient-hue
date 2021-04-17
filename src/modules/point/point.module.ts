import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { HueModule } from '../hue/hue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Point]), HueModule],
  controllers: [PointController],
  providers: [PointService],
  exports: [TypeOrmModule, PointService],
})
export class PointModule {}
