import { Injectable, Logger } from '@nestjs/common';
import { PLATFORM_NAME } from '../../homebridge/settings';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface Config {
  host?: string;
  port?: number;
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

  public readonly uiHost: string;
  public readonly uiPort: number;
  public readonly hueHost: string;
  public readonly hueUser: string;
  public readonly database: string;
  public readonly prefix: string;
  public readonly homebridge: string;

  constructor() {
    const homebridgeConfig = fs.readJSONSync(this.configPath);
    const config: Config = Array.isArray(homebridgeConfig.platforms)
      ? homebridgeConfig.platforms.find((x) => x.platform === PLATFORM_NAME)
      : {};

    if (config.bridgeIp === undefined) {
      this.logger.error(`No HUE IP in Config file ${this.configPath}`);
      throw new Error(`No HUE IP in Config file ${this.configPath}`);
    }
    if (config.user === undefined) {
      this.logger.error(`No HUE User in Config file ${this.configPath}`);
      throw new Error(`No HUE User in Config file ${this.configPath}`);
    }

    this.uiHost = config.host || '0.0.0.0';
    this.uiPort = config.port || 3000;

    this.hueHost = config.bridgeIp;
    this.hueUser = config.user;
    this.database =
      config.database ||
      path.resolve(os.homedir(), '.homebridge/ambient-hue.sqlite');
    this.prefix = config.prefix || 'Auto ';

    this.homebridge = homebridgeConfig.bridge.username || '0E:67:56:95:CA:D8';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: this.database,
      entities: ['dist/**/*.entity.js'],
      keepConnectionAlive: true,
      migrationsTableName: 'migration',
      migrations: ['src/migration/*.js'],
      cli: {
        'migrationsDir': 'src/migration',
      },
      migrationsRun: true,
    };
  }
}
