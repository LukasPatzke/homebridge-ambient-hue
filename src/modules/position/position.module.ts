import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Position])],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [TypeOrmModule, PositionService],
})
export class PositionModule {}
