import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { PositionModule } from '../position/position.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), PositionModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [TypeOrmModule, PositionModule, GroupService],
})
export class GroupModule {}
