import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { GroupService } from '../group/group.service';
import { Light } from './entities/light.v2.entity';
import { instanceToPlain } from 'class-transformer';

@WebSocketGateway({ transports: ['websocket'] })
export class LightGateway {
  private readonly logger = new Logger(LightGateway.name);

  constructor(private groupService: GroupService) {}

  @WebSocketServer()
  server: Server;

  async emitUpdate(light: Light) {
    this.logger.debug(`Emitting light update for light ${light.id} ${light.name}`);
    this.server.emit(`update/${light.accessoryId}`, instanceToPlain(light));

    const groups = await this.groupService.findByLightId(light.id);
    groups.forEach((group) => {
      this.server.emit(`update/${group.accessoryId}`, instanceToPlain(group));
    });
  }
}
