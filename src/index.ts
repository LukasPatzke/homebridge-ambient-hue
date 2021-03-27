import { API } from 'homebridge';

import { PLATFORM_NAME } from './homebridge/settings';
import { ExampleHomebridgePlatform } from './homebridge/platform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, ExampleHomebridgePlatform);
};
