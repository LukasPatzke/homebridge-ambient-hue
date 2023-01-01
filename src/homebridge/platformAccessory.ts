import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import axios from 'axios';
import { Group } from '../modules/group/entities/group.entity';
import { Light } from '../modules/light/entities/light.entity';
import { AmbientHueHomebridgePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Device<T extends Light | Group> {
  private service: Service;

  constructor(
    private readonly platform: AmbientHueHomebridgePlatform,
    public readonly accessory: PlatformAccessory<T>,
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'AmbientHue',
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        this.model(accessory.context),
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        accessory.context.accessoryId,
      );

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.displayName,
    );

    // register handlers for the On/Off Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    // this.service
    //   .getCharacteristic(this.platform.Characteristic.Brightness)
    //   .onSet(this.setBrightness.bind(this)); // SET - bind to the 'setBrightness` method below

    // Register update handler
    this.platform.socket.on(`update/${this.accessory.UUID}`, (device: T) => {
      this.platform.log.debug('update homekit for id', this.accessory.UUID);
      this.update(device);
    });
  }

  /**
   * Update chracteristics
   * @param device Light or Group
   */
  update(device: T) {
    const service = this.accessory.getService(this.platform.Service.Lightbulb);
    if (service) {
      service.updateCharacteristic(this.platform.Characteristic.On, device.on);
    }
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    // this.exampleStates.On = value as boolean;
    this.platform.log.debug('Set Characteristic On ->', value);

    axios
      .patch(`${this.platform.serverUri}/api/accessories/${this.accessory.UUID}`, {
        on: value,
      })
      .catch(this.platform.log.error);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on

    return axios
      .get<T>(`${this.platform.serverUri}/api/accessories/${this.accessory.UUID}`)
      .catch((err) => {
        this.platform.log.error(err);
        throw new this.platform.api.hap.HapStatusError(
          this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE,
        );
      })
      .then((res) => res.data.on);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setBrightness(value: CharacteristicValue) {
    // implement your own code to set the brightness

    this.platform.log.debug('Set Characteristic Brightness -> ', value);
  }

  isGroup(device: Light | Group): device is Group {
    return (device as Group).type !== undefined;
  }

  model(device: Light | Group): string {
    if (this.isGroup(device)) {
      return 'AmbientHue-Room';
    } else {
      return 'AmbientHue-Light';
    }
  }
}
