import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { MovePositionDto } from './dto/move-position.dto';

@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  findAll() {
    return this.positionService.findAll();
  }

  @Patch()
  move(@Body() movePositionDto: MovePositionDto) {
    return this.positionService.move(movePositionDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positionService.remove(+id);
  }
}
