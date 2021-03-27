import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CurveService } from './curve.service';
import { CreateCurveDto, curveKind } from './dto/create-curve.dto';
import { InsertPointDto } from './dto/insert-point.dto';
import { UpdateCurveDto } from './dto/update-curve.dto';

@Controller('curves')
export class CurveController {
  constructor(private readonly curveService: CurveService) {}

  @Post()
  create(@Body() createCurveDto: CreateCurveDto) {
    return this.curveService.create(createCurveDto);
  }

  @Get()
  findAll(@Query('kind') kind: curveKind) {
    if (kind===undefined) {
      return this.curveService.findAll();
    } else {
      return this.curveService.findByKind(kind);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curveService.findOne(+id);
  }

  @Post(':id')
  insertPoint(@Param('id') id: string, @Body() insertPointDto: InsertPointDto) {
    return this.curveService.insertPoint(+id, insertPointDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurveDto: UpdateCurveDto) {
    return this.curveService.update(+id, updateCurveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curveService.remove(+id);
  }
}
