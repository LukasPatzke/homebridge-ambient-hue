import {
  forwardRef,
  HttpService,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v5 as uuidv5 } from 'uuid';
import { hueLight, hueSetState } from './dto/hueLight.dto';
import { hueGroup } from './dto/hueGroup.dto';
import { map } from 'rxjs/operators';
import { LightService } from '../light/light.service';
import { GroupService } from '../group/group.service';
import { Light } from '../light/entities/light.entity';
import { ConfigService } from '../config/config.service';

@Injectable()
export class HueService {
  private readonly logger = new Logger(HueService.name);
  private baseurl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(forwardRef(() => LightService))
    private lightService: LightService,
    private groupService: GroupService,
  ) {
    const host = this.configService.hueHost;
    const user = this.configService.hueUser;

    this.baseurl = `http://${host}/api/${user}`;
  }

  async onModuleInit() {
    this.logger.log('Syncronize with Hue bridge.');
    await this.sync();
  }

  findAllLights(): Promise<Record<string, hueLight>> {
    return this.httpService
      .get(`${this.baseurl}/lights`)
      .pipe(map((response) => response.data))
      .toPromise()
      .catch((err) => {
        this.logger.log(err);
        throw new InternalServerErrorException(err);
      });
  }

  findOneLight(id: number): Promise<hueLight> {
    return this.httpService
      .get(`${this.baseurl}/lights/${id}`)
      .pipe(map((response) => response.data))
      .toPromise()
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  findAllGroups(): Promise<Record<string, hueGroup>> {
    return this.httpService
      .get(`${this.baseurl}/groups`)
      .pipe(map((response) => response.data))
      .toPromise()
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  findOneGroup(id: number): Promise<hueGroup> {
    return this.httpService
      .get(`${this.baseurl}/groups/${id}`)
      .pipe(map((response) => response.data))
      .toPromise()
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  setLightState(id: number, state: hueSetState) {
    return this.httpService
      .put(`${this.baseurl}/lights/${id}/state`, state)
      .pipe(map((response) => response.data))
      .toPromise();
  }

  /**
   * Calculate and execute the current state
   * @param forLights execute only for these lights
   */
  async update(forLights?: Light[]) {
    this.logger.log('Running update');
    const currentLights = await this.findAllLights();
    const lights = forLights || (await this.lightService.findAll());

    let countUpdated = 0;

    lights.forEach(async (light) => {
      const currentLightState = currentLights[light.id.toString()].state;

      const nextState = await this.lightService.nextState(
        light,
        currentLightState,
      );
      if (Object.keys(nextState).length > 0) {
        await this.setLightState(light.id, nextState);
        this.lightService.resetSmartOff(light);
        countUpdated += 1;
      }
    });
    return { message: `${countUpdated} lights updated` };
  }

  /**
   * Synchronize database with hue bridge
   * @returns Count of lights and groups
   */
  async sync() {
    const lights = await this.lightService.findAll();
    const groups = await this.groupService.findAll();
    const hueLights = await this.findAllLights();
    const hueGroups = await this.findAllGroups();

    /** Create/Update Lights */
    for (const lightId in hueLights) {
      const hueLight = hueLights[lightId];
      const id = parseInt(lightId);
      const light = lights.find((light) => light.id === id);

      if (light === undefined) {
        await this.lightService.create({
          id: id,
          uniqueId: this.generateUuid(lightId, 'light'),
          name: hueLight.name,
          type: hueLight.type,
          modelid: hueLight.modelid,
          manufacturername: hueLight.manufacturername,
          productname: hueLight.productname,
        });
      } else {
        await this.lightService.update(id, {
          name: hueLight.name,
          type: hueLight.type,
          modelid: hueLight.modelid,
          manufacturername: hueLight.manufacturername,
          productname: hueLight.productname,
        });
      }
    }
    /** Delete Lights */
    lights.forEach((light) => {
      if (!(light.id.toString() in hueLights)) {
        this.lightService.remove(light.id);
      }
    });

    /** Create/Update Groups */
    for (const groupId in hueGroups) {
      const hueGroup = hueGroups[groupId];
      const id = parseInt(groupId);
      const group = groups.find((group) => group.id === id);
      const lights = await this.lightService.findByIds(
        hueGroup.lights.map((id) => parseInt(id)),
      );

      if (group === undefined) {
        await this.groupService.create({
          id: id,
          uniqueId: this.generateUuid(groupId, 'group'),
          name: hueGroup.name,
          type: hueGroup.type,
          lights: lights,
        });
      } else {
        await this.groupService.update(id, {
          name: hueGroup.name,
          type: hueGroup.type,
          lights: lights,
        });
      }
    }
    /** Delete Groups */
    groups.forEach((group) => {
      if (!(group.id.toString() in hueGroups)) {
        this.groupService.remove(group.id);
      }
    });

    return {
      lights: await this.lightService.count(),
      groups: await this.groupService.count(),
    };
  }

  generateUuid(id: string, type: 'light' | 'group') {
    const NAMESPACE = '97722234-dae4-4ed5-b316-c2424ee4f2d1';
    return uuidv5(`${type}-${id}`, NAMESPACE);
  }
}
