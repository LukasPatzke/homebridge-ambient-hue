import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { PointService } from './point.service';
import { UpdatePointDto } from './dto/update-point.dto';

@Controller('points')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pointService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePointDto: UpdatePointDto) {
    return this.pointService.update(+id, updatePointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pointService.remove(+id);
  }
}
