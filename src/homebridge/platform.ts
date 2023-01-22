import axios from 'axios';
import {
  API,
  Characteristic,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
} from 'homebridge';
import { io, Socket } from 'socket.io-client';
import { bootstrap } from '../main';
import { ConfigService } from '../modules/config/config.service';
import { Group } from '../modules/group/entities/group.entity';
import { Light } from '../modules/light/entities/light.entity';
import { Device } from './platformAccessory';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';

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
  public accessories: PlatformAccessory<Group | Light>[] = [];

  public readonly configService: ConfigService;

  public readonly serverUri: string;
  public readonly homebridgeUUID: string;

  public socket: Socket;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    process.env.HAH_CONFIG_PATH = api.user.configPath();
    process.env.HAH_STORAGE_PATH = api.user.storagePath();
    this.configService = new ConfigService();
    this.serverUri = `http://localhost:${this.configService.uiPort}`;
    this.homebridgeUUID = this.api.hap.uuid.generate(
      this.configService.homebridge,
    );

    process.env.AMBIENTHUE_DEBUG = this.configService.debugLog
      ? 'TRUE'
      : 'FALSE';

    const app = bootstrap();

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

    Promise.all([socketConnected, homebridgeLaunched, app])
      .catch((err) => {
        this.log.error(JSON.stringify(err));
      })
      .then(() => {
        this.log.debug('Finished initializing platform:', this.config.name);
        this.discoverDevices();
      });

    // Register handler for publishing / unpublishing
    this.socket.on('publish', (device: Light | Group) => {
      this.log.debug(
        `Recieved publish update for ${device.name}: ${JSON.stringify(
          device.published,
          null,
          2,
        )}`,
      );
      const accessory = this.accessories.find(
        (a) => a.UUID === device.accessoryId,
      );

      if (device.published === true && accessory === undefined) {
        this.log.info(
          `Register accessory ${device.accessoryId} for device ${device.name}`,
        );
        this.registerDevice(device);
      }

      if (device.published === false && accessory !== undefined) {
        this.log.warn(
          `Unregister accessory ${device.accessoryId} for device ${device.name}`,
        );
        this.unregisterDevice(device);
      }
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory<Group | Light>) {
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
    const accessories = await axios
      .get<(Light | Group)[]>(`${this.serverUri}/api/accessories`)
      .then((res) => res.data.filter((a) => a.published));

    this.log.debug('discovered ', accessories.length, ' accessories.');

    // loop over the discovered devices and register each one if it has not already been registered
    for (const accessory of accessories) {
      this.registerDevice(accessory);
    }

    // Remove stale accessories
    const staleAccessories = this.accessories.filter(
      (accessory) =>
        !accessories.map((i) => i.accessoryId).includes(accessory.UUID),
    );
    if (staleAccessories.length > 0) {
      this.log.warn(
        'Removing stale accessories: ',
        JSON.stringify(staleAccessories.map((a) => a.displayName)),
      );
      for (const accessory of staleAccessories) {
        if (accessory.context.id) {
          this.unregisterDevice(accessory.context);
        } else {
          // remove legacy updateAccessory
          this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
            accessory,
          ]);
          this.accessories = this.accessories.filter(
            (a) => a.UUID !== accessory.UUID,
          );
        }
      }
    }
  }

  unregisterDevice<T extends Light | Group>(device: T) {
    const existingAccessory = this.accessories.find(
      (accessory) => accessory.UUID === device.accessoryId,
    );

    if (existingAccessory) {
      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        existingAccessory,
      ]);
      this.accessories = this.accessories.filter(
        (accessory) => accessory.UUID !== device.accessoryId,
      );
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
      (accessory) => accessory.UUID === device.accessoryId,
    );

    if (existingAccessory) {
      // the accessory already exists
      this.log.debug(
        'Restoring existing accessory from cache:',
        existingAccessory.displayName,
      );
      // Update the accessory context
      existingAccessory.context = device;
      existingAccessory.displayName = this.displayName(device.name);
      this.api.updatePlatformAccessories([existingAccessory]);

      // create the accessory handler for the restored accessory
      new Device(this, existingAccessory);
    } else {
      // the accessory does not yet exist, so we need to create it
      this.log.info('Adding new accessory for Device:', device.name);

      // create a new accessory
      const accessory = new this.api.platformAccessory<T>(
        this.displayName(device.name),
        device.accessoryId,
      );

      // store a copy of the device object in the `accessory.context`
      // the `context` property can be used to store any data about the accessory you may need
      accessory.context = device;

      // create the accessory handler for the newly create accessory
      new Device(this, accessory);

      // link the accessory to your platform
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        accessory,
      ]);

      this.accessories.push(accessory);
    }
  }

  displayName(name: string): string {
    return `${this.configService.prefix}${name}${this.configService.suffix}`;
  }
}
