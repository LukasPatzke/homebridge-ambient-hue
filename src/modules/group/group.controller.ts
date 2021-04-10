import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { UpdateInterceptor } from '../hue/update.interceptor';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(UpdateInterceptor)
  async update(
    @Param('id') id: string,
    @Body() updateLightDto: UpdateLightDto,
  ) {
    return this.groupService.updateLights(+id, updateLightDto);
  }
}
