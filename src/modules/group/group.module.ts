import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessoryModule } from '../accessory/accessory.module';
import { HueModule } from '../hue/hue.module';
import { LightModule } from '../light/light.module';
import { Group } from './entities/group.entity';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    forwardRef(() => LightModule),
    HueModule,
    forwardRef(() => AccessoryModule),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
