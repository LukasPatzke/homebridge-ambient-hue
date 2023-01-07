import {
  Body, ClassSerializerInterceptor, Controller,
  Get, Param, Patch, UseInterceptors,
} from '@nestjs/common';
import { UpdateInterceptor } from '../hue/update.interceptor';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { GroupService } from './group.service';

@Controller('groups')
@UseInterceptors(ClassSerializerInterceptor)
export class GroupController {
  constructor(private readonly groupService: GroupService) { }

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
