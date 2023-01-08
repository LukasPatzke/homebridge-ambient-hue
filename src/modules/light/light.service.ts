import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AccessoryGateway } from '../accessory/accesory.gateway';
import { BrightnessCurveService } from '../curve/brightness.curve.service';
import { ColorTemperatureCurveService } from '../curve/colorTemperature.curve.service';
import { CurveService } from '../curve/curve.service';
import { isBrightnessCurveWithPoints } from '../curve/entities/brightness.curve.entity';
import { isColorTemperatureCurveWithPoints } from '../curve/entities/colorTemperature.curve.entity';
import { LightGet } from '../hue/hue.api.v2';
import { CreateLightDto } from './dto/create-light.dto';
import { UpdateLightDto } from './dto/update-light.dto';
import { Light } from './entities/light.entity';

@Injectable()
export class LightService {
  private readonly logger = new Logger(LightService.name);

  constructor(
    @InjectRepository(Light)
    private lightsRepository: Repository<Light>,
    private curveService: CurveService,
    private brightnessCurveService: BrightnessCurveService,
    private colorTemperatureCurveService: ColorTemperatureCurveService,
    private accessoryGateway: AccessoryGateway,
  ) {}

  async create(createLightDto: CreateLightDto): Promise<Light> {
    this.logger.debug(
      `Create light ${createLightDto.name}: ${JSON.stringify(createLightDto)}`,
    );
    const light = this.lightsRepository.create(createLightDto);
    return this.lightsRepository.save(light);
  }

  findAll(): Promise<Light[]> {
    return this.lightsRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  findOne(id: number): Promise<Light> {
    return this.lightsRepository.findOneBy({ id: id }).then((light) => {
      if (light === null) {
        throw new NotFoundException(`Light with id ${id} not found.`);
      }
      return light;
    });
  }

  findByHueIds(hueIds: string[]): Promise<Light[]> {
    return this.lightsRepository.findBy({ hueId: In(hueIds) });
  }

  findByAccessoryId(accessoryId: string): Promise<Light> {
    return this.lightsRepository
      .findOneBy({ accessoryId: accessoryId })
      .then((light) => {
        if (light === null) {
          throw new NotFoundException(
            `Light with accessoryId ${accessoryId} not found.`,
          );
        }
        return light;
      });
  }

  async updateByHueId(hueId: string, updateLightDto: UpdateLightDto) {
    const light = await this.lightsRepository.findOneBy({
      hueId: hueId,
    });
    if (light === null) {
      throw new NotFoundException(`Light with hue id ${hueId} not found.`);
    }
    return this.update(light.id, updateLightDto);
  }

  async update(id: number, updateLightDto: UpdateLightDto) {
    this.logger.debug(`Update light ${id}: ${JSON.stringify(updateLightDto)}`);

    let light = await this.findOne(id);

    // If the update contains curve IDs, they need to be attached manually
    if (updateLightDto.brightnessCurveId !== undefined) {
      updateLightDto.brightnessCurve = await this.brightnessCurveService.findOne(
        updateLightDto.brightnessCurveId,
      );
    }
    if (updateLightDto.colorTemperatureCurveId !== undefined) {
      updateLightDto.colorTemperatureCurve = await this.colorTemperatureCurveService.findOne(
        updateLightDto.colorTemperatureCurveId,
      );
    }

    const isOnChanged =
      updateLightDto.on !== light.on && updateLightDto.on !== undefined;
    const isPublishedChanged =
      updateLightDto.published !== light.published &&
      updateLightDto.published !== undefined;

    this.lightsRepository.merge(light, updateLightDto);

    light = await this.lightsRepository.save(light);
    if (isOnChanged) {
      this.resetSmartOff(light);
      this.accessoryGateway.emitUpdate(light);
    }
    if (isPublishedChanged) {
      this.accessoryGateway.emitPublish(light);
    }
    return light;
  }

  count() {
    return this.lightsRepository.count();
  }

  async remove(id: number) {
    this.logger.log(`Delete light ${id}`);
    await this.lightsRepository.delete(id);
  }

  /**
   * Calculate the current brightness for a light.
   * @param light
   */
  async brightness(light: Light) {
    let value: number;
    if (isBrightnessCurveWithPoints(light.brightnessCurve)) {
      value = await this.curveService.calcValue(light.brightnessCurve);
    } else {
      const curve = await this.brightnessCurveService.findOne(
        light.brightnessCurve.id,
      );
      value = await this.curveService.calcValue(curve);
    }
    return Math.min(100, Math.floor((light.brightnessFactor / 100) * value));
  }

  /**
   * Calculate the current color temperature for a light.
   * @param light
   */
  async colorTemp(light: Light) {
    if (isColorTemperatureCurveWithPoints(light.colorTemperatureCurve)) {
      return this.curveService.calcValue(light.colorTemperatureCurve);
    } else {
      const curve = await this.colorTemperatureCurveService.findOne(
        light.colorTemperatureCurve.id,
      );
      return this.curveService.calcValue(curve);
    }
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
  async nextState(light: Light): Promise<Partial<LightGet>> {
    let state: Partial<LightGet> = {};

    const brightness = await this.brightness(light);
    const colorTemp = await this.colorTemp(light);

    if (!light.on) {
      if (light.currentOn && light.onControlled && !light.smartOffOn) {
        state.on = { on: false };
      }
      // If the light should be off, we don't care about any other property.
      return state;
    }

    if (light.onControlled && !light.smartOffOn) {
      if (brightness > light.onThreshold) {
        state.on = { on: true };
      } else {
        state.on = { on: false };
        // Do not send a request if the light stays off
        if (light.currentOn === false) {
          state = {};
        }
        // If the light should be off, we don't care about any other property.
        return state;
      }
    }

    if (
      light.colorTemperatureControlled &&
      !light.smartOffColorTemperature &&
      light.currentColorTemperature !== colorTemp
    ) {
      state.color_temperature = { mirek: colorTemp };
    }
    if (
      light.brightnessControlled &&
      !light.smartOffBrightness &&
      light.currentBrightness !== brightness
    ) {
      state.dimming = { brightness: brightness };
    }

    // Signify recommends to not resent the 'on' value
    if (state.on?.on === light.currentOn) {
      delete state.on;
    }

    return state;
  }
}
