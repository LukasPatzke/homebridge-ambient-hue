import { Module } from '@nestjs/common';
import { CurveService } from './curve.service';
import { CurveController } from './curve.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curve } from './entities/curve.entity';
import { PointModule } from '../point/point.module';

@Module({
  imports: [TypeOrmModule.forFeature([Curve]), PointModule],
  controllers: [CurveController],
  providers: [CurveService],
  exports: [TypeOrmModule, CurveService, PointModule],
})
export class CurveModule {}
