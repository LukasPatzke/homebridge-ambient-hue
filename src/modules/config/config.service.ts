import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { DataSourceOptions } from 'typeorm';
import { PLATFORM_NAME } from '../../homebridge/settings';
import { init1618418126240 } from '../../migration/1618418126240-init';
import { v21672495111704 } from '../../migration/1672495111704-v2';
import { BrightnessCurve } from '../curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from '../curve/entities/colorTemperature.curve.entity';
import { Group } from '../group/entities/group.entity';
import { Light } from '../light/entities/light.entity';
import { CustomLogger } from '../logger/logger.service';
import { Point } from '../point/entities/point.entity';

export interface Config {
  host?: string;
  port?: number;
  bridgeIp?: string;
  user?: string;
  database?: string;
  prefix?: string;
  suffix?: string;
  debugLog: boolean;
  enableSchedule?: boolean;
}

@Injectable()
export class ConfigService {
  private readonly logger = new CustomLogger(ConfigService.name);

  public configPath =
    process.env.HAH_CONFIG_PATH ||
    path.resolve(os.homedir(), '.homebridge/config.json');

  public storagePath =
    process.env.HAH_STORAGE_PATH || path.resolve(os.homedir(), '.homebridge');

  public readonly uiHost: string;
  public readonly uiPort: number;
  public readonly hueHost: string;
  public readonly hueUser?: string;
  public readonly database: string;
  public readonly prefix: string;
  public readonly suffix: string;
  public readonly homebridge: string;
  public readonly debugLog: boolean;
  public readonly enableSchedule: boolean;

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
      this.logger.warn(`No HUE User in Config file ${this.configPath}`);
    }

    this.uiHost = config.host || '0.0.0.0';
    this.uiPort = config.port || 3000;

    this.hueHost = config.bridgeIp;
    this.hueUser = config.user;
    this.database =
      config.database || path.resolve(this.storagePath, 'ambient-hue.sqlite');
    this.prefix = config.prefix || '';
    this.suffix = config.suffix || ' Auto';
    this.debugLog = config.debugLog;
    this.enableSchedule =
      config.enableSchedule === undefined ? true : config.enableSchedule;

    this.homebridge = homebridgeConfig.bridge.username || '0E:67:56:95:CA:D8';

    if (this.enableSchedule === false) {
      this.logger.warn('Scheduled updates are disabled.');
    }

    this.logger.debug('Configuration loaded');
    this.logger.debug(
      JSON.stringify(config, null, 2).replace(config.user || '', '***'),
    );
  }

  public getTypeOrmConfig(): DataSourceOptions {
    return {
      type: 'sqlite',
      database: this.database,
      entities: [BrightnessCurve, ColorTemperatureCurve, Group, Light, Point],
      migrationsTableName: 'migration',
      migrations: [init1618418126240, v21672495111704],
      migrationsRun: true,
      logging: ['error'],
    };
  }
}
