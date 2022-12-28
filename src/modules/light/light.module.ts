import { forwardRef, Module } from '@nestjs/common';
import { LightService } from './light.service';
import { LightController } from './light.controller';
import { LightV1 } from './entities/light.v1.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurveModule } from '../curve/curve.module';
import { PointModule } from '../point/point.module';
import { LightGateway } from './light.gateway';
import { GroupModule } from '../group/group.module';
import { Light } from './entities/light.v2.entity';
import { HueModule } from '../hue/hue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LightV1, Light]),
    CurveModule,
    forwardRef(() => HueModule),
    forwardRef(() => GroupModule),
    PointModule,
  ],
  controllers: [LightController],
  providers: [LightService, LightGateway],
  exports: [
    TypeOrmModule,
    LightService,
    LightGateway,
    HueModule,
    CurveModule,
    PointModule,
  ],
})
export class LightModule {}
