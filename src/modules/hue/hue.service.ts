import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { v5 as uuidv5 } from 'uuid';
import { hueLight, hueSetState, hueStateResponse } from './dto/hueLight.dto';
import { hueGroup } from './dto/hueGroup.dto';
import { LightService } from '../light/light.service';
import { GroupService } from '../group/group.service';
import { Light } from '../light/entities/light.entity';
import { ConfigService } from '../config/config.service';
import { lastValueFrom, catchError, map } from 'rxjs';
import { AxiosError } from 'axios';
import { hueErrorResponse } from './dto/hueResponse.dto';

interface HueUserResponse {
  success?: {
    username: string;
  };
  error?: {
    type: number;
    address: string;
    description: string;
  };
}

function isHueErrorResponse(response: any): response is hueErrorResponse {
  if (!Array.isArray(response)) {
    return false;
  }
  return (response as hueErrorResponse)[0].error !== undefined;
}

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
    const host = this.configService.hueHost;
    let user = this.configService.hueUser;

    if (user === undefined) {
      const newUser = await this.createUser();
      if (newUser === undefined) {
        this.logger.error('Registration in HUE bridge failed.');
        throw new InternalServerErrorException(
          'Registration in HUE bridge failed.',
        );
      } else {
        user = newUser;
      }
    }

    this.baseurl = `http://${host}/api/${user}`;

    this.logger.log('Syncronize with Hue bridge.');
    await this.sync();
  }

  private get<T = any>(url: string): Promise<T> {
    this.logger.debug(`GET ${url}`);
    return lastValueFrom(this.httpService
      .get<T | hueErrorResponse>(url)
      .pipe(
        catchError((err: AxiosError) => {
          this.logger.error(err);
          throw err.message;
        }),
        map((response) => {
          if (isHueErrorResponse(response.data)) {
            const description = response.data[0].error.description;
            this.logger.error(description);
            throw description;
          }
          return response.data;
        }),
      ),
    );
  }

  findAllLights(): Promise<Record<string, hueLight>> {
    return this.get<Record<string, hueLight>>(`${this.baseurl}/lights`);
  }

  findOneLight(id: number): Promise<hueLight> {
    return this.get<hueLight>(`${this.baseurl}/lights/${id}`);
  }

  findAllGroups(): Promise<Record<string, hueGroup>> {
    return this.get<Record<string, hueGroup>>(`${this.baseurl}/groups`);
  }

  findOneGroup(id: number): Promise<hueGroup> {
    return this.get<hueGroup>(`${this.baseurl}/groups/${id}`);
  }

  setLightState(id: number, state: hueSetState) {
    const url = `${this.baseurl}/lights/${id}/state`;
    this.logger.debug(
      `PUT ${url}::${JSON.stringify(state)}`,
    );
    return lastValueFrom(this.httpService
      .put<hueStateResponse>(url, state)
      .pipe(
        catchError((err: AxiosError) => {
          this.logger.error(err);
          throw err.message;
        }),
        map((response) => {
          const data = response.data;
          data.forEach((item) => {
            if (item.error !== undefined) {
              const error = item.error;
              this.logger.error(
                `Error ${error.type} on PUT to ${error.address} on ${this.configService.hueHost}: ${error.description}`,
              );
            }
          });
          return data;
        }),
      ));
  }

  /**
   * Calculate and execute the current state
   * @param forLights execute only for these lights
   */
  async update(forLights?: Light[]) {
    this.logger.debug('Running update');
    const currentLights = await this.findAllLights();
    const lights = forLights || (await this.lightService.findAll());

    const updates = lights.map(
      async (light): Promise<number> => {
        const currentLightState = currentLights[light.id.toString()].state;

        const nextState = await this.lightService.nextState(
          light,
          currentLightState,
        );
        if (Object.keys(nextState).length > 0) {
          const response = await this.setLightState(light.id, nextState);
          this.lightService.updateSmartOff(light, response);
          return 1;
        }
        return 0;
      },
    );

    const countUpdated = (await Promise.all(updates)).reduce(
      (pv, cv) => pv + cv,
      0,
    );
    this.logger.debug(`${countUpdated} lights updated`);
    return countUpdated;
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

  /**
   * Create a new user in the HUE bridge.
   * @returns new user
   */
  async createUser() {
    let counter = 0;
    while (counter < 20) {
      this.logger.log(
        'No HUE bridge user in config found. Please press the button on the bridge to register a new user.',
      );

      const response = await lastValueFrom(this.httpService
        .post<HueUserResponse[]>(`http://${this.configService.hueHost}/api`, {
          devicetype: 'homebridge-ambient-hue',
        })
        .pipe(map((response) => response.data[0])),
      );

      if (response.success) {
        const hueUser = response.success.username;
        this.logger.log(
          `User registered. Please add "user": "${hueUser}" to the config.json.`,
        );
        return hueUser;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
      counter += 1;
    }
    return undefined;
  }
}
