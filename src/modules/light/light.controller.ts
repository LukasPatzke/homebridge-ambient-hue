import {
  Body, ClassSerializerInterceptor, Controller,
  Get, Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateInterceptor } from '../hue/update.interceptor';
import { UpdateLightDto } from './dto/update-light.dto';
import { LightService } from './light.service';

@Controller('lights')
@UseInterceptors(ClassSerializerInterceptor)
export class LightController {
  constructor(private readonly lightService: LightService) { }

  @Get()
  findAll() {
    return this.lightService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lightService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(UpdateInterceptor)
  async update(
    @Param('id') id: string,
    @Body() updateLightDto: UpdateLightDto,
  ) {
    return this.lightService.update(+id, updateLightDto);
  }

  @Post(':id/reset')
  @UseInterceptors(UpdateInterceptor)
  async reset(
    @Param('id') id: string,
  ) {
    const light = await this.lightService.findOne(+id);
    return this.lightService.resetSmartOff(light);
  }
}
