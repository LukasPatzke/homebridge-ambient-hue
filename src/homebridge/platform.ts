import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { LightPlatformAccessory } from './platformAccessory';
import io from 'socket.io-client';
import * as path from 'path';
import * as child_process from 'child_process';
import axios from 'axios';
import { ConfigService } from '../modules/config/config.service';
import { Light } from 'src/modules/light/entities/light.entity';
import { Group } from 'src/modules/group/entities/group.entity';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class AmbientHueHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap
    .Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public readonly configService: ConfigService;

  public readonly serverUri: string;

  public socket: SocketIOClient.Socket;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    process.env.HAH_CONFIG_PATH = api.user.configPath();
    this.fork();
    this.configService = new ConfigService();
    this.serverUri = `http://localhost:${this.configService.uiPort}`;

    this.socket = io(`ws://localhost:${this.configService.uiPort}`, {
      transports: ['websocket'],
    });

    const socketConnected = new Promise<void>((resolve, reject) => {
      this.socket.on('connect', () => {
        this.log.debug('Connected to socket', this.socket.id);
        resolve();
      });
      this.socket.on('error', (err) => {
        reject(err);
      });
    });

    const homebridgeLaunched = new Promise<void>((resolve) => {
      this.api.on('didFinishLaunching', () => {
        resolve();
      });
    });

    Promise.all([socketConnected, homebridgeLaunched])
      .catch((err) => {
        this.log.error(JSON.stringify(err));
      })
      .then(() => {
        this.log.debug('Finished initializing platform:', this.config.name);
        this.discoverDevices();
      });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    // this.api.on('didFinishLaunching', () => {
    //   log.debug('Executed didFinishLaunching callback');
    //   // run the method to discover / register your devices as accessories
    //   this.discoverDevices();
    // });
  }

  /**
   * Run plugin as a seperate node.js process
   */
  fork() {
    const ui = child_process.fork(
      path.resolve(__dirname, 'bin/fork'),
      undefined,
      {
        env: process.env,
      },
    );

    this.log.info('Spawning homebridge-ambient-hue with PID', ui.pid);

    ui.on('close', () => {
      process.kill(process.pid, 'SIGTERM');
    });

    ui.on('error', (err) => {
      this.log.error(err.message);
    });
  }

  /**
   * Run plugin in the main homebridge process.
   */
  async noFork() {
    await import('../main');
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.debug('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  async discoverDevices() {
    // EXAMPLE ONLY
    // A real plugin you would discover accessories from the local network, cloud services
    // or a user-defined array in the platform config.

    // const lights = http.get('http://localhost:3000/api/lights', (res) => {
    //   this.log.info('lights', res);
    // });
    // const socket = io('ws://localhost:3000');

    // this.socket.emit('lights', (res) => {
    //   this.log.info('lights', res.length);
    // });

    const lights = await axios
      .get<Light[]>(`${this.serverUri}/api/lights`)
      .then((res) => res.data);

    const groups = await axios
      .get<Group[]>(`${this.serverUri}/api/groups`)
      .then((res) => res.data);

    this.log.debug('lights:', lights.length, '| groups:', groups.length);


    // loop over the discovered devices and register each one if it has not already been registered
    for (const light of lights) {
      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      // const uuid = this.api.hap.uuid.generate(device.exampleUniqueId);

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === light.uniqueId,
      );

      if (existingAccessory) {
        // the accessory already exists
        this.log.debug(
          'Restoring existing accessory from cache:',
          existingAccessory.displayName,
        );
        new LightPlatformAccessory(this, existingAccessory as PlatformAccessory<Light>);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        // existingAccessory.context.device = device;
        // this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        //new ExamplePlatformAccessory(this, existingAccessory);

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory for light:', light.name);

        // create a new accessory
        const accessory = new this.api.platformAccessory<Light>(
          this.configService.prefix + light.name,
          light.uniqueId,
        );

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context = light;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        new LightPlatformAccessory(this, accessory);

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
