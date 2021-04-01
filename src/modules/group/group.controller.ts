import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { HueService } from '../hue/hue.service';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly hueService: HueService,
  ) {}

  @Get()
  findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLightDto: UpdateLightDto,
  ) {
    const group = await this.groupService.updateLights(+id, updateLightDto);
    this.hueService.update();
    return group;
  }
}
