import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { LightService } from './light.service';
import { CreateLightDto } from './dto/create-light.dto';
import { UpdateLightDto } from './dto/update-light.dto';
import { HueService } from '../hue/hue.service';

@Controller('lights')
export class LightController {
  constructor(
    private readonly lightService: LightService,
    private readonly hueService: HueService,
  ) {}

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
  async update(
    @Param('id') id: string,
    @Body() updateLightDto: UpdateLightDto,
  ) {
    const light = await this.lightService.update(+id, updateLightDto);
    this.hueService.update();
    return light;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lightService.remove(+id);
  }
}
