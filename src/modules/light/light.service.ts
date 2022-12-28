import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLightDto } from './dto/create-light.dto';
import { UpdateLightDto } from './dto/update-light.dto';
import { In, Repository } from 'typeorm';
import { CurveService } from '../curve/curve.service';
import { AccessoryGateway } from '../accessory/accesory.gateway';
import { Light } from './entities/light.v2.entity';
import { LightGet } from '../hue/hue.api.v2';
import { LightV1 } from './entities/light.v1.entity';

@Injectable()
export class LightService {
  private readonly logger = new Logger(LightService.name);

  constructor(
    @InjectRepository(Light)
    private lightsRepository: Repository<Light>,
    @InjectRepository(LightV1)
    private lightsRepositoryV1: Repository<LightV1>,
    private curveService: CurveService,
    private accessoryGateway: AccessoryGateway,
  ) { }

  async create(createLightDto: CreateLightDto): Promise<Light> {
    const light = this.lightsRepository.create(createLightDto);
    return this.lightsRepository.save(light);
  }

  findAll(): Promise<Light[]> {
    return this.lightsRepository.find();
  }

  findOne(id: string): Promise<Light> {
    return this.lightsRepository.findOneBy({id: id}).then((light) => {
      if (light === null) {
        throw new NotFoundException(`Light with id ${id} not found.`);
      }
      return light;
    });
  }

  findByIds(ids: string[]): Promise<Light[]> {
    return this.lightsRepository.findBy({ id: In(ids) });
  }

  findByAccessoryId(accessoryId: string): Promise<Light> {
    return this.lightsRepository.findOneBy({ accessoryId: accessoryId }).then((light) => {
      if (light === null) {
        throw new NotFoundException(`Light with accessoryId ${accessoryId} not found.`);
      }
      return light;
    });
  }

  async update(id: string, updateLightDto: UpdateLightDto) {
    this.logger.debug(`Update light ${id}: ${JSON.stringify(updateLightDto)}`);

    let light = await this.findOne(id);

    // If the update contains curve IDs, they need to be attached manually
    if (updateLightDto.brightnessCurveId !== undefined) {
      updateLightDto.brightnessCurve = await this.curveService.findOne(
        updateLightDto.brightnessCurveId,
      );
    }
    if (updateLightDto.colorTemperatureCurveId !== undefined) {
      updateLightDto.colorTemperatureCurve = await this.curveService.findOne(
        updateLightDto.colorTemperatureCurveId,
      );
    }

    const isOnChanged = (updateLightDto.on !== light.on) && (updateLightDto.on !== undefined);
    if (isOnChanged) {
      this.resetSmartOff(light);
    }

    this.lightsRepository.merge(light, updateLightDto);

    light = await this.lightsRepository.save(light);
    if (isOnChanged) {
      this.accessoryGateway.emitUpdate(light);
    }
    return light;
  }

  count() {
    return this.lightsRepository.count();
  }

  async remove(id: string) {
    await this.lightsRepository.delete(id);
  }

  /**
   * Access lights in the depricated v1 schema that where not successfully migrated
   */
  findAllNotMigratedV1(): Promise<LightV1[]> {
    return this.lightsRepositoryV1.find({where: {isMigrated: false}});
  }

  /**
   * Mark a v1 entity as successfully migrated to the v1 schema
   * @param id
   */
  async markAsMigratedV1(id: number) {
    const light = await this.lightsRepositoryV1.findOneBy({id: id});
    if (light === null) {
      return false;
    }
    light.isMigrated = true;
    await this.lightsRepositoryV1.save(light);
    return true;
  }

  /**
   * Calculate the current brightness for a light.
   * @param light
   */
  async brightness(light: Light) {
    const curve =
      light.brightnessCurve || (await this.curveService.findDefault('bri'));
    const value = await this.curveService.calcValue(curve.id);
    return Math.min(100, Math.floor((light.brightnessFactor / 100) * value));
  }

  /**
   * Calculate the current color temperature for a light.
   * @param light
   */
  async colorTemp(light: Light) {
    const curve = light.colorTemperatureCurve || (await this.curveService.findDefault('ct'));
    return this.curveService.calcValue(curve.id);
  }

  /**
   * Reset the values last sent by ambientHUE
   * @param light the light to update
   * @returns
   */
  async resetSmartOff(light: Light) {
    this.logger.debug(`Reset smart off for light ${light.id} ${light.name}`);

    light.lastOn = light.currentOn;
    light.lastBrightness = light.currentBrightness;
    light.lastColorTemperature = light.currentColorTemperature;

    return this.lightsRepository.save(light);
  }

  /**
   * Calculate the neccessary state changes for a given light
   * @param light the light to calculate for
   * @returns the data that can be sent to the hue bridge
   */
  async nextState(
    light: Light,
  ): Promise<Partial<LightGet>> {
    let state: Partial<LightGet> = {};

    const brightness = await this.brightness(light);
    const colorTemp = await this.colorTemp(light);

    if (!light.on) {
      if (light.currentOn && light.onControlled && !light.smartOffOn) {
        state.on = {on: false};
      }
      // If the light should be off, we don't care about any other property.
      return state;
    }

    if (light.onControlled && !light.smartOffOn) {
      if (brightness > light.onThreshold) {
        state.on = {on: true};
      } else {
        state.on = {on: false};
        // Do not send a request if the light stays off
        if (light.currentOn === false) {
          state = {};
        }
        // If the light should be off, we don't care about any other property.
        return state;
      }
    }

    if (light.colorTemperatureControlled && !light.smartOffColorTemperature && light.currentColorTemperature !== colorTemp) {
      state.color_temperature = {mirek: colorTemp};
    }
    if (light.brightnessControlled && !light.smartOffBrightness && light.currentBrightness !== brightness) {
      state.dimming = {brightness: brightness};
    }

    // Signify recommends to not resent the 'on' value
    if (state.on?.on === light.currentOn) {
      delete state.on;
    }

    return state;
  }
}
