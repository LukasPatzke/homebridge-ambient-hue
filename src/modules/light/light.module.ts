import { forwardRef, Module } from '@nestjs/common';
import { LightService } from './light.service';
import { LightController } from './light.controller';
import { Light } from './entities/light.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurveModule } from '../curve/curve.module';
import { HueModule } from '../hue/hue.module';
import { PositionModule } from '../position/position.module';
import { PointModule } from '../point/point.module';

@Module({
  imports: [TypeOrmModule.forFeature([Light]), CurveModule, forwardRef(()=>HueModule), PositionModule, PointModule],
  controllers: [LightController],
  providers: [LightService],
  exports: [TypeOrmModule, LightService, HueModule, CurveModule, PositionModule, PointModule],
})
export class LightModule {}
