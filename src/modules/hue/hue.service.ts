import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LightService } from '../light/light.service';
import { GroupService } from '../group/group.service';
import { ConfigService } from '../config/config.service';
import { lastValueFrom, catchError, map, Subject, debounceTime } from 'rxjs';
import { AxiosError, AxiosRequestConfig } from 'axios';
import EventSource from 'eventsource';
import {
  BridgeConfig,
  DeviceGet,
  isLightEvent,
  JSONResponse,
  LightGet,
  ResourceIdentifier,
  RoomGet,
  StreamingResponse,
  ZoneGet,
  isRoomGet,
} from './hue.api.v2';
import { Light } from '../light/entities/light.v2.entity';
import { CurveService } from '../curve/curve.service';
import { PointService } from '../point/point.service';

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


@Injectable()
export class HueService {
  private readonly logger = new Logger(HueService.name);
  private baseurl: string;
  private apiKey: string;
  private eventSource: EventSource;
  private updateQueue: Subject<undefined>;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(forwardRef(() => LightService))
    private lightService: LightService,
    @Inject(forwardRef(() => GroupService))
    private groupService: GroupService,
    @Inject(forwardRef(() => CurveService))
    private curveService: CurveService,
    @Inject(forwardRef(() => PointService))
    private pointService: PointService,
  ) {
    this.updateQueue = new Subject();
  }

  async onModuleInit() {
    const host = this.configService.hueHost;
    let user = this.configService.hueUser;

    // Create a new user if none was configurated
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

    this.baseurl = `https://${host}/clip/v2`;
    this.apiKey = user;

    if (await this.isApiv2Available()) {
      this.logger.log('CLIPv2 API is available.');
    } else {
      this.logger.error('CLIPv2 API is not available. The hue bridge is not supported an has to be updated.');
      throw new InternalServerErrorException(
        'CLIPv2 API is not available. The hue bridge is not supported an has to be updated.',
      );
    }

    // Setup the queue for updates
    this.updateQueue.pipe(
      // updates are called only every 250ms
      debounceTime(250),
    ).subscribe(()=>{
      this.update();
    });

    // Setup the eventstream for updates from hue
    this.eventSource = new EventSource(`https://${host}/eventstream/clip/v2`, {
      headers: { 'hue-application-key': this.apiKey },
      https: { rejectUnauthorized: false },
    });

    this.logger.log('Migrate to v2 schema.');
    await this.migrateToV2();
    this.logger.log('Syncronize with Hue bridge.');
    await this.sync();

    this.eventSource.onmessage = (event) => {
      const data: StreamingResponse[] = JSON.parse(event.data);

      data.forEach(event => {
        if (event.type === 'update') {
          event.data.forEach(eventData => {
            if (isLightEvent(eventData)) {
              // this.logger.debug(JSON.stringify(eventData, null, 2));
              this.lightService.update(eventData.id, {
                currentOn: eventData.on?.on,
                currentBrightness: eventData.dimming?.brightness,
                currentColorTemperature: eventData.color_temperature?.mirek,
              });
            }
          });
        }
      });
    };
  }

  /**
   * Injects the api key into the headers and sends the request.
   * @param config
   * @throws InternalServerErrorExeption
   * @returns the response data
   */
  private request<T, D=any>(config: AxiosRequestConfig<D>) {
    this.logger.debug(`${config.method} ${config.url}::${JSON.stringify(config.data)}`);
    return lastValueFrom(this.httpService.request<T>({
      ...config,
      headers: {
        ...config.headers,
        'hue-application-key': this.apiKey,
      },
    }).pipe(
      catchError((err: AxiosError) => {
        //this.logger.error(err);
        throw new InternalServerErrorException(err.message);
      }),
      map(response => response.data),
    ));
  }

  private get<T = any>(url: string): Promise<T> {
    return this.request<T>({url: url, method: 'GET'});
  }

  findAllLights(): Promise<LightGet[]> {
    return this.get<JSONResponse<LightGet>>(`${this.baseurl}/resource/light`).then(res => res.data);
  }

  findOneLight(id: string): Promise<LightGet> {
    return this.get<JSONResponse<LightGet>>(`${this.baseurl}/resource/light/${id}`).then(res => res.data[0]);
  }

  findAllRooms(): Promise<RoomGet[]> {
    return this.get<JSONResponse<RoomGet>>(`${this.baseurl}/resource/room`).then(res => res.data);
  }

  findOneRoom(id: string): Promise<RoomGet> {
    return this.get<JSONResponse<RoomGet>>(`${this.baseurl}/resource/room/${id}`).then(res => res.data[0]);
  }

  findAllZones(): Promise<ZoneGet[]> {
    return this.get<JSONResponse<ZoneGet>>(`${this.baseurl}/resource/zone`).then(res => res.data);
  }

  findOneZone(id: string): Promise<ZoneGet> {
    return this.get<JSONResponse<ZoneGet>>(`${this.baseurl}/resource/zone/${id}`).then(res => res.data[0]);
  }

  findAllDevices(): Promise<DeviceGet[]> {
    return this.get<JSONResponse<DeviceGet>>(`${this.baseurl}/resource/device`).then(res => res.data);
  }

  findOneDevice(id: string): Promise<DeviceGet> {
    return this.get<JSONResponse<DeviceGet>>(`${this.baseurl}/resource/device/${id}`).then(res => res.data[0]);
  }

  setLightState(id: string, state: Partial<LightGet>) {
    return this.request<JSONResponse<ResourceIdentifier>>({
      url: `${this.baseurl}/resource/light/${id}`,
      method: 'PUT',
      data: state,
    }).then(response => {
      this.lightService.update(id, {
        currentOn: state.on?.on,
        currentBrightness: state.dimming?.brightness,
        currentColorTemperature: state.color_temperature?.mirek,
      });
      return response;
    });
  }

  /**
   * Queue an execution of the update function
   * The Queue is debounced and will be executed after a
   * time span has passed without a new emission
   */
  queueUpdate() {
    this.logger.debug('Adding to update queue');
    this.updateQueue.next(undefined);
  }

  /**
   * Calculate and execute the current state
   */
  async update() {
    this.logger.debug('Running update');
    const lights = await this.lightService.findAll();

    const updates = lights.map(
      async (light): Promise<number> => {
        const nextState = await this.lightService.nextState(light);

        if (Object.keys(nextState).length > 0) {
          await this.setLightState(light.id, nextState);
          this.lightService.resetSmartOff(light);
          return 1;
        }
        return 0;
      },
    );

    const countUpdated = (await Promise.all(updates)).reduce(
      (accumulator, current) => accumulator + current, 0,
    );
    this.logger.debug(`${countUpdated} lights updated`);
    return countUpdated;
  }

  /**
   * Migrate database contents to the new v2 api schema
   */
  async migrateToV2() {
    const lights = await this.lightService.findAllNotMigratedV1();
    const groups = await this.groupService.findAllNotMigratedV1();

    if ((lights.length === 0) && (groups.length === 0)) {
      // There are no lights to migrate
      return;
    }
    const hueLights = await this.findAllLights();
    const hueRooms = await this.findAllRooms();
    const hueZones = await this.findAllZones();
    const hueDevices = await this.findAllDevices();

    // The brightness scale was changed from 0-254 to 0-100
    const migrateBrightnessValue = (value: number) => (
      Math.floor(value / 2.54)
    );

    const light_migrations = lights.map(async v1 => {
      const legacyId = `/lights/${v1.id}`;
      const hueLight = hueLights.find(i=>i.id_v1 === legacyId);

      if (hueLight === undefined) {
        // The light does not exist anymore
        await this.lightService.markAsMigratedV1(v1.id);
        this.logger.log(`Light ${v1.id} was not migrated because it does not exist in the bridge.`);
        return;
      }

      await this.lightService.create({
        id: hueLight.id,
        legacyId: legacyId,
        accessoryId: v1.uniqueId,
        deviceId: hueLight.owner.rid,
        name: hueLight.metadata.name,
        archetype: hueLight.metadata.archetype,
        on: v1.on,
        onControlled: v1.onControlled,
        onThreshold: migrateBrightnessValue(v1.onThreshold),
        brightnessControlled: v1.briControlled,
        brightnessFactor: migrateBrightnessValue(v1.briMax),
        colorTemperatureControlled: v1.ctControlled,
        published: v1.published,
        brightnessCurve: v1.briCurve,
        colorTemperatureCurve: v1.ctCurve,
      });

      await this.lightService.markAsMigratedV1(v1.id);
      this.logger.log(`Light ${v1.id} successfully migrated.`);
    });

    await Promise.all(light_migrations);

    const group_migrations = groups.map(async v1 => {
      const legacyId = `/groups/${v1.id}`;
      const hueGroup = hueRooms.find(r=>r.id_v1===legacyId) || hueZones.find(z=>z.id_v1===legacyId);

      if (hueGroup === undefined) {
        // The group does not exist anymore
        await this.groupService.markAsMigratedV1(v1.id);
        this.logger.log(`Group ${v1.id} was not migrated because it does not exist in the bridge.`);
        return;
      }
      let lights: Light[];
      if (isRoomGet(hueGroup)) {
        lights = await this.lightService.findByIds(await this.findLightIdsByRoom(hueGroup, hueDevices));
      } else {
        lights = await this.lightService.findByIds(await this.findLightIdsByZone(hueGroup));
      }

      await this.groupService.create({
        id: hueGroup.id,
        legacyId: legacyId,
        accessoryId: v1.uniqueId,
        name: hueGroup.metadata.name,
        type: hueGroup.type,
        lights: lights,
        published: v1.published,
      });

      await this.groupService.markAsMigratedV1(v1.id);
      this.logger.log(`Group ${v1.id} successfully migrated.`);
    });

    await Promise.all(group_migrations);

    // Migrate brightness curves
    const curves = await this.curveService.findByKind('bri');

    const curve_migrations = curves.map(curve=>{
      return curve.points.map(point=>{
        return this.pointService.update(point.id, {
          y: migrateBrightnessValue(point.y),
        });
      });
    });

    await Promise.all(curve_migrations);

  }

  /**
   *  Determine the light ids for a room from the device children
   * @param room
   */
  async findLightIdsByRoom(room: RoomGet, hueDevices: DeviceGet[]): Promise<string[]> {
    const lightIds: string[] = [];

    // Determine the light ids from the device children
    room.children.forEach(child => {
      if (child.rtype === 'device') {
        const device = hueDevices.find(device => device.id === child.rid);
        return device?.services.map(service => {
          if (service.rtype === 'light') {
            if (!lightIds.includes(service.rid)) {
              lightIds.push(service.rid);
            }
          }
        });
      }
    });
    return lightIds;
  }

  /**
   * Determine the light ids for a zone from the children
   * @param zone
   */
  async findLightIdsByZone(zone: ZoneGet): Promise<string[]> {
    const lightIds: string[] = [];

    // Determine the light ids from the children
    zone.children.forEach(child => {
      if (child.rtype === 'light') {
        if (!lightIds.includes(child.rid)) {
          lightIds.push(child.rid);
        }
      }
    });

    return lightIds;
  }

  /**
   * Synchronize database with hue bridge
   * @returns Count of lights and groups
   */
  async sync() {
    const lights = await this.lightService.findAll();
    const groups = await this.groupService.findAll();
    const hueLights = await this.findAllLights();
    const hueRooms = await this.findAllRooms();
    const hueZones = await this.findAllZones();
    const hueDevices = await this.findAllDevices();

    /** Create/Update Lights */
    hueLights.forEach(async hueLight => {
      const light = lights.find(light => light.id === hueLight.id);

      if (light === undefined) {
        // Create a new light
        await this.lightService.create({
          id: hueLight.id,
          legacyId: hueLight.id_v1,
          accessoryId: hueLight.id,
          deviceId: hueLight.owner.rid,
          name: hueLight.metadata.name,
          archetype: hueLight.metadata.archetype,
          currentOn: hueLight.on.on,
          currentBrightness: hueLight.dimming?.brightness,
          currentColorTemperature: hueLight.color_temperature?.mirek,
        });
      } else {
        // Update an existing light
        await this.lightService.update(hueLight.id, {
          name: hueLight.metadata.name,
          archetype: hueLight.metadata.archetype,
          currentOn: hueLight.on.on,
          currentBrightness: hueLight.dimming?.brightness,
          currentColorTemperature: hueLight.color_temperature?.mirek,
        });
      }
    });

    // Delete lights that don't exist in the bridge
    lights.forEach((light) => {
      const hueLight = hueLights.find(l=>l.id===light.id);
      if (hueLight===undefined) {
        this.lightService.remove(light.id);
      }
    });

    /** Create/Update Rooms */
    hueRooms.forEach(async hueRoom => {
      const group = groups.find(group => group.id === hueRoom.id);

      const lightIds = await this.findLightIdsByRoom(hueRoom, hueDevices);
      const lights = await this.lightService.findByIds(lightIds);

      if (group === undefined) {
        // Create a new group
        await this.groupService.create({
          id: hueRoom.id,
          legacyId: hueRoom.id_v1,
          accessoryId: hueRoom.id,
          name: hueRoom.metadata.name,
          type: hueRoom.type,
          lights: lights,
        });
      } else {
        // Update an existing group
        await this.groupService.update(hueRoom.id, {
          name: hueRoom.metadata.name,
          type: hueRoom.type,
          lights: lights,
        });
      }
    });

    /** Create/Update Zones */
    hueZones.forEach(async hueZone => {
      const group = groups.find(group => group.id === hueZone.id);

      const lightIds: string[] = await this.findLightIdsByZone(hueZone);
      const lights = await this.lightService.findByIds(lightIds);

      if (group === undefined) {
        // Create a new group
        await this.groupService.create({
          id: hueZone.id,
          legacyId: hueZone.id_v1,
          accessoryId: hueZone.id,
          name: hueZone.metadata.name,
          type: hueZone.type,
          lights: lights,
        });
      } else {
        // Update an existing group
        await this.groupService.update(hueZone.id, {
          name: hueZone.metadata.name,
          type: hueZone.type,
          lights: lights,
        });
      }
    });


    /** Delete Groups */
    groups.forEach((group) => {
      const hueRoom = hueRooms.find(r=>r.id===group.id);
      const hueZone = hueZones.find(r=>r.id===group.id);
      if ((hueRoom===undefined) && (hueZone===undefined)) {
        this.groupService.remove(group.id);
      }
    });

    return {
      lights: await this.lightService.count(),
      groups: await this.groupService.count(),
    };
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
        .post<HueUserResponse[]>(`https://${this.configService.hueHost}/api`, {
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

  /**
   * Check whether the CLIPv2 API is available on the bridge
   */
  async isApiv2Available() {
    const config = await this.get<BridgeConfig>(`https://${this.configService.hueHost}/api/config`);
    return config.swversion >= '1948086000';
  }
}
