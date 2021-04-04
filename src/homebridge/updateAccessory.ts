import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { AmbientHueHomebridgePlatform } from './platform';
import axios from 'axios';


/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class updateAccessory {
  private service: Service;

  constructor(
    private readonly platform: AmbientHueHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
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
        'AmbientHue-Lightbulb',
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        'Default-Serial',
      );

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      'AmbientHue Update',
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
      .get(
        `${this.platform.serverUri}/api/hue/update`,
      )
      .catch(this.platform.log.error)
      .then(() => {
        const switchService = this.accessory.getService(this.platform.Service.Switch);
        if (switchService) {
          switchService.updateCharacteristic(this.platform.Characteristic.On, false);
        }
      });

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
  getOn():CharacteristicValue {
    return false;
  }

}
