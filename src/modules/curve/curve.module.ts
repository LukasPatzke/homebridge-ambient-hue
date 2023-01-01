import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HueModule } from '../hue/hue.module';
import { PointModule } from '../point/point.module';
import { BrightnessCurveController } from './brightness.curve.controller';
import { BrightnessCurveService } from './brightness.curve.service';
import { ColorTemperatureCurveController } from './colorTemperature.curve.controller';
import { ColorTemperatureCurveService } from './colorTemperature.curve.service';
import { CurveService } from './curve.service';
import { BrightnessCurve } from './entities/brightness.curve.entity';
import { ColorTemperatureCurve } from './entities/colorTemperature.curve.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BrightnessCurve, ColorTemperatureCurve]), PointModule, HueModule],
  controllers: [BrightnessCurveController, ColorTemperatureCurveController],
  providers: [CurveService, BrightnessCurveService, ColorTemperatureCurveService],
  exports: [CurveService, BrightnessCurveService, ColorTemperatureCurveService],
})
export class CurveModule {}
