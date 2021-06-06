import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Light } from './entities/light.entity';
import { GroupService } from '../group/group.service';

@WebSocketGateway({ transports: ['websocket'] })
export class LightGateway {
  private readonly logger = new Logger(LightGateway.name);

  constructor(private groupService: GroupService) {}

  @WebSocketServer()
  server: Server;

  async emitUpdate(light: Light) {
    this.logger.debug(`Emitting light update for light ${light.id}`);
    this.server.emit(`update/${light.uniqueId}`, light);

    const groups = await this.groupService.findByLight(light.id);
    groups.forEach((group) => {
      this.server.emit(`update/${group.uniqueId}`, group);
    });
  }
}
