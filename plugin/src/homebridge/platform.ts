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
import { Device } from './platformAccessory';
import io from 'socket.io-client';
import * as path from 'path';
import * as child_process from 'child_process';
import axios from 'axios';
import { ConfigService } from '../modules/config/config.service';
import { Light } from '../modules/light/entities/light.entity';
import { Group } from '../modules/group/entities/group.entity';
import { updateAccessory } from './updateAccessory';

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
  public readonly deviceAccessories: Device<Light | Group>[] = [];

  public readonly configService: ConfigService;

  public readonly serverUri: string;
  public readonly homebridgeUUID: string;

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
    this.homebridgeUUID = this.api.hap.uuid.generate(
      this.configService.homebridge,
    );

    this.socket = io(`ws://localhost:${this.configService.uiPort}`, {
      transports: ['websocket'],
    });

    // When the socket connects, the server finished starting
    const socketConnected = new Promise<void>((resolve, reject) => {
      this.socket.on('connect', () => {
        this.log.debug('Connected to socket', this.socket.id);
        resolve();
      });
      this.socket.on('error', (err) => {
        reject(err);
      });
    });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
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
    const lights = await axios
      .get<Light[]>(`${this.serverUri}/api/lights`)
      .then((res) => res.data);

    const groups = await axios
      .get<Group[]>(`${this.serverUri}/api/groups`)
      .then((res) => res.data);

    this.log.debug('lights:', lights.length, '| groups:', groups.length);

    // loop over the discovered devices and register each one if it has not already been registered
    for (const light of lights) {
      this.registerDevice(light);
    }

    for (const group of groups) {
      this.registerDevice(group);
    }

    const existingUpdateAccessory = this.accessories.find(
      (accessory) => accessory.UUID === this.homebridgeUUID,
    );

    if (existingUpdateAccessory) {
      new updateAccessory(this, existingUpdateAccessory);
    } else {
      const accessory = new this.api.platformAccessory(
        'AmbientHue',
        this.homebridgeUUID,
      );
      new updateAccessory(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
    }
  }

  /**
   * Create/Load the accessory and register in homebridge.
   * @param device Device to register
   */
  registerDevice<T extends Light | Group>(device: T) {
    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find(
      (accessory) => accessory.UUID === device.uniqueId,
    );

    if (existingAccessory) {
      // the accessory already exists
      this.log.debug(
        'Restoring existing accessory from cache:',
        existingAccessory.displayName,
      );

      // Update the accessory context
      existingAccessory.context = device;
      this.api.updatePlatformAccessories([existingAccessory]);

      // create the accessory handler for the restored accessory
      this.deviceAccessories.push(new Device(this, existingAccessory as PlatformAccessory<T>));

    } else {
      // the accessory does not yet exist, so we need to create it
      this.log.info('Adding new accessory for Device:', device.name);

      // create a new accessory
      const accessory = new this.api.platformAccessory<T>(
        this.configService.prefix + device.name,
        device.uniqueId,
      );

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context = device;

      // create the accessory handler for the newly create accessory
      this.deviceAccessories.push(new Device(this, accessory));

      // link the accessory to your platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);
    }
  }
}
