import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessoryModule } from '../accessory/accessory.module';
import { CurveModule } from '../curve/curve.module';
import { GroupModule } from '../group/group.module';
import { HueModule } from '../hue/hue.module';
import { Light } from './entities/light.entity';
import { LightController } from './light.controller';
import { LightService } from './light.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Light]),
    CurveModule,
    GroupModule,
    AccessoryModule,
    HueModule,
  ],
  controllers: [LightController],
  providers: [LightService],
  exports: [
    LightService,
  ],
})
export class LightModule {}
