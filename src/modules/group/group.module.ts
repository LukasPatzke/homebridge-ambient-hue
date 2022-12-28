import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupV1 } from './entities/group.v1.entity';
import { LightModule } from '../light/light.module';
import { LightService } from '../light/light.service';
import { HueModule } from '../hue/hue.module';
import { Group } from './entities/group.v2.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupV1, Group]),
    forwardRef(() => LightModule),
    forwardRef(() => HueModule),
  ],
  controllers: [GroupController],
  providers: [GroupService, LightService],
  exports: [TypeOrmModule, GroupService],
})
export class GroupModule {}
