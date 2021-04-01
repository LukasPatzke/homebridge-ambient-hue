import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UpdateLightWsDto } from '../light/dto/update-light-ws.dto';
import { HueService } from '../hue/hue.service';
import { GroupService } from './group.service';

@WebSocketGateway()
export class GroupGateway {
  constructor(
    private groupService: GroupService,
    private hueService: HueService,
  ) {}

  @SubscribeMessage('updateGroup')
  async update(@MessageBody() payload: UpdateLightWsDto) {
    const group = await this.groupService.update(payload.id, payload);
    await this.hueService.update();
    return group;
  }
}
