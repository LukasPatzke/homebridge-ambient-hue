import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { LightService } from './light.service';
import { CreateLightDto } from './dto/create-light.dto';
import { UpdateLightDto } from './dto/update-light.dto';

@Controller('lights')
export class LightController {
  constructor(private readonly lightService: LightService) {}

  @Post()
  create(@Body() createLightDto: CreateLightDto) {
    return this.lightService.create(createLightDto);
  }

  @Get()
  findAll() {
    return this.lightService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lightService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLightDto: UpdateLightDto) {
    return this.lightService.update(+id, updateLightDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lightService.remove(+id);
  }
}
