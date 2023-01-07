import { forwardRef, Inject, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { instanceToPlain } from 'class-transformer';
import { Server } from 'socket.io';
import { Group } from '../group/entities/group.entity';
import { GroupService } from '../group/group.service';
import { Light } from '../light/entities/light.entity';

@WebSocketGateway({ transports: ['websocket'] })
export class AccessoryGateway {
  private readonly logger = new Logger(AccessoryGateway.name);

  constructor(
    @Inject(forwardRef(() => GroupService))
    private groupService: GroupService) { }

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

  emitPublish(accessory: Light | Group) {
    this.logger.debug(`Emitting publish update for accessory ${accessory.id} ${accessory.name}`);
    this.server.emit('publish', instanceToPlain(accessory));
  }
}
