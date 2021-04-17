import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { PositionModule } from '../position/position.module';
import { LightModule } from '../light/light.module';
import { LightService } from '../light/light.service';
import { HueModule } from '../hue/hue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    PositionModule,
    forwardRef(() => LightModule),
    forwardRef(() => HueModule),
  ],
  controllers: [GroupController],
  providers: [GroupService, LightService],
  exports: [TypeOrmModule, PositionModule, GroupService],
})
export class GroupModule {}
