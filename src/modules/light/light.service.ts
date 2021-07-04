import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLightDto } from './dto/create-light.dto';
import { UpdateLightDto } from './dto/update-light.dto';
import { Light } from './entities/light.entity';
import { Repository } from 'typeorm';
import { CurveService } from '../curve/curve.service';
import { hueLightState, hueSetState, hueStateResponse } from '../hue/dto/hueLight.dto';
import { HueService } from '../hue/hue.service';
import { PositionService } from '../position/position.service';
import { LightGateway } from './light.gateway';

@Injectable()
export class LightService {
  private readonly logger = new Logger(LightService.name);

  constructor(
    @InjectRepository(Light)
    private lightsRepository: Repository<Light>,
    private curveService: CurveService,
    @Inject(forwardRef(() => HueService))
    private hueService: HueService,
    private positionService: PositionService,
    private lightGateway: LightGateway,
  ) { }

  async create(createLightDto: CreateLightDto): Promise<Light> {
    const light = this.lightsRepository.create(createLightDto);
    light.position = await this.positionService.create({});
    return this.lightsRepository.save(light);
  }

  findAll(): Promise<Light[]> {
    return this.lightsRepository.find();
  }

  findOne(id: number): Promise<Light> {
    return this.lightsRepository.findOne(id).then((light) => {
      if (light === undefined) {
        throw new NotFoundException(`Light with id ${id} not found.`);
      } else {
        return light;
      }
    });
  }

  findByIds(ids: number[]) {
    return this.lightsRepository.findByIds(ids);
  }

  findByUniqueId(uniqueId: string) {
    return this.lightsRepository.findOne({ uniqueId: uniqueId });
  }

  async update(id: number, updateLightDto: UpdateLightDto) {
    this.logger.debug(`Update light ${id}: ${JSON.stringify(updateLightDto)}`);

    let light = await this.findOne(id);
    if (updateLightDto.briCurveId !== undefined) {
      updateLightDto.briCurve = await this.curveService.findOne(
        updateLightDto.briCurveId,
      );
    }
    if (updateLightDto.ctCurveId !== undefined) {
      updateLightDto.ctCurve = await this.curveService.findOne(
        updateLightDto.ctCurveId,
      );
    }

    if ((updateLightDto.on !== light.on) && (light.on !== undefined)) {
      this.resetSmartOff(light);
    }

    this.lightsRepository.merge(light, updateLightDto);

    light = await this.lightsRepository.save(light);
    this.lightGateway.emitUpdate(light);

    return light;
  }

  count() {
    return this.lightsRepository.count();
  }

  async remove(id: number) {
    await this.lightsRepository.delete(id);
  }

  /**
   * Calculate the current brightness for a light.
   * @param light
   */
  async brightness(light: Light) {
    const curve =
      light.briCurve || (await this.curveService.findDefault('bri'));
    const value = await this.curveService.calcValue(curve.id);
    return Math.floor((light.briMax / 254) * value);
  }

  /**
   * Calculate the current color temperature for a light.
   * @param light
   */
  async colorTemp(light: Light) {
    const curve = light.ctCurve || (await this.curveService.findDefault('ct'));
    return this.curveService.calcValue(curve.id);
  }

  /**
   * Calculate the smart of state of the light.
   * @param light
   * @param currentState
   */
  smartOff(light: Light, currentState: hueLightState) {
    let on = false;
    let bri = false;
    let ct = false;
    const logInfo: string[] = [];

    if (light.onControlled) {
      on = light.smartoffOn !== null && light.smartoffOn !== currentState.on;
      if (on) {
        logInfo.push(`on: ${light.smartoffOn} !== ${currentState.on}`);
      }
    }

    if (light.briControlled) {
      bri =
        light.smartoffBri !== null && (Math.abs(light.smartoffBri - currentState.bri) >= 1);
      if (bri) {
        logInfo.push(`bri: ${light.smartoffBri} !== ${currentState.bri}`);
      }
    }

    if (light.ctControlled) {
      ct = light.smartoffCt !== null && (Math.abs(light.smartoffCt - currentState.ct) >= 1);
      if (ct) {
        logInfo.push(`ct: ${light.smartoffCt} !== ${currentState.ct}`);
      }
    }

    const isSmartoffActive = on || bri || ct;
    const smartOff = { on: on, bri: bri, ct: ct };
    light.smartoffActive = isSmartoffActive;
    this.lightsRepository.save(light);

    if (isSmartoffActive) {
      this.logger.log(`Smart off active for light ${light.id}: ${JSON.stringify(smartOff)}; ${logInfo.join(', ')}`);
    }

    return smartOff;
  }

  async resetSmartOff(light: Light) {
    this.logger.debug(`Reset smart off for light ${light.id}`);
    const hue = await this.hueService.findOneLight(light.id);

    light.smartoffOn = hue.state.on;
    light.smartoffBri = hue.state.bri;
    light.smartoffCt = hue.state.ct;
    light.smartoffActive = false;

    return this.lightsRepository.save(light);
  }

  async updateSmartOff(light: Light, hueResponse: hueStateResponse) {
    this.logger.debug(`Update smart off for light ${light.id}: ${JSON.stringify(hueResponse)}`);

    hueResponse.forEach(item => {
      if (item.success !== undefined) {
        const address = Object.keys(item.success)[0];
        const match = address.match(/\/lights\/\d+\/state\/(\w+)/);
        if (match === null) {
          this.logger.error(`Hue response item cannot be parsed: ${JSON.stringify(item)}`);
        } else {
          const param = match[1];
          switch (param) {
            case 'on':
              light.smartoffOn = item.success[address] as boolean;
              break;
            case 'bri':
              light.smartoffBri = item.success[address] as number;
              break;
            case 'ct':
              light.smartoffCt = item.success[address] as number;
              break;
            default:
              this.logger.warn(`Hue response gave unknown parameter ${param} in ${JSON.stringify(item)}`);
              break;
          }
        }
      }
    });

    return this.lightsRepository.save(light);
  }

  async nextState(
    light: Light,
    currentState: hueLightState,
  ): Promise<hueSetState> {
    let state: hueSetState = {};

    const brightness = await this.brightness(light);
    const colorTemp = await this.colorTemp(light);
    const smartOff = this.smartOff(light, currentState);

    if (!light.on) {
      if (currentState.on && light.onControlled && !smartOff.on) {
        state.on = false;
      }
      return state;
    }

    if (light.ctControlled && !smartOff.ct && currentState.ct !== colorTemp) {
      state.ct = colorTemp;
    }
    if (
      light.briControlled &&
      !smartOff.bri &&
      currentState.bri !== brightness
    ) {
      state.bri = brightness;
    }
    if (light.onControlled && !smartOff.on) {
      if (brightness > light.onThreshold) {
        state.on = true;
      } else {
        state.on = false;
      }
    }
    if (state.on === false) {
      state = { on: false };
    }

    // Do not send a request if the light stays off
    if (currentState.on === false && state.on !== true) {
      state = {};
    }

    // Signify recommends to not resent the 'on' value
    if (state.on === currentState.on) {
      delete state.on;
    }

    return state;
  }
}
