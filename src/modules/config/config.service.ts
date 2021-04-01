import { Injectable, Logger } from '@nestjs/common';
import { PLATFORM_NAME } from '../../homebridge/settings';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  uiHost?: string;
  uiPort?: number;
  bridgeIp?: string;
  user?: string;
  database?: string;
  prefix?: string;
}
@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  public configPath =
    process.env.HAH_CONFIG_PATH ||
    path.resolve(os.homedir(), '.homebridge/config.json');

  public uiHost: string;
  public uiPort: number;
  public hueHost?: string;
  public hueUser?: string;
  public database: string;
  public prefix: string;

  constructor() {
    const homebridgeConfig = fs.readJSONSync(this.configPath);
    const config: Config = Array.isArray(homebridgeConfig.platforms)
      ? homebridgeConfig.platforms.find((x) => x.platform === PLATFORM_NAME)
      : {};

    this.uiHost = config.uiHost || ' 0.0.0.0';
    this.uiPort = config.uiPort || 3000;
    this.hueHost = config.bridgeIp;
    this.hueUser = config.user;
    this.database =
      config.database ||
      path.resolve(os.homedir(), '.homebridge/ambient-hue.sqlite');
    this.prefix = config.prefix || 'Auto ';
  }
}
