import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLightDto } from './dto/create-light.dto';
import { UpdateLightDto } from './dto/update-light.dto';
import { Light } from './entities/light.entity';
import { Repository } from 'typeorm';
import { CurveService } from '../curve/curve.service';
import { hueLightState, hueSetState } from '../hue/dto/hueLight.dto';
import { HueService } from '../hue/hue.service';
import { PositionService } from '../position/position.service';
import { LightGateway } from './light.gateway';

@Injectable()
export class LightService {
  constructor(
    @InjectRepository(Light)
    private lightsRepository: Repository<Light>,
    private curveService: CurveService,
    @Inject(forwardRef(()=>HueService))
    private hueService: HueService,
    private positionService: PositionService,
    private lightGateway: LightGateway,
  ) {}

  async create(createLightDto: CreateLightDto): Promise<Light> {
    const light = this.lightsRepository.create(createLightDto);
    light.position = await this.positionService.create({});
    return this.lightsRepository.save(light);
  }

  findAll(): Promise<Light[]> {
    return this.lightsRepository.find();
  }

  findOne(id: number): Promise<Light> {
    return this.lightsRepository.findOne(id).then(light=>{
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
    return this.lightsRepository.findOne({uniqueId: uniqueId}).then(light=>{
      if (light === undefined) {
        throw new NotFoundException(`Light with uniqueId ${uniqueId} not found.`);
      } else {
        return light;
      }
    });
  }

  async update(id: number, updateLightDto: UpdateLightDto) {
    const light = await this.findOne(id);
    if (updateLightDto.briCurveId!== undefined) {
      updateLightDto.briCurve = await this.curveService.findOne(updateLightDto.briCurveId);
    }
    if (updateLightDto.ctCurveId!== undefined) {
      updateLightDto.ctCurve = await this.curveService.findOne(updateLightDto.ctCurveId);
    }
    this.lightsRepository.merge(light, updateLightDto);
    this.lightGateway.emitUpdate(light);

    if (updateLightDto.on !== undefined) {
      return this.resetSmartOff(light);
    } else {
      return this.lightsRepository.save(light);
    }
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
    const curve = light.briCurve || await this.curveService.findDefault('bri');
    const value = await this.curveService.calcValue(curve.id);
    return Math.floor((light.briMax/254) * value);
  }

  /**
   * Calculate the current color temperature for a light.
   * @param light
   */
  async colorTemp(light: Light) {
    const curve = light.ctCurve || await this.curveService.findDefault('ct');
    return this.curveService.calcValue(curve.id);
  }

  /**
   * Calculate the smart of state of the light.
   * @param light
   * @param prevLightState
   */
  smartOff(light: Light, prevLightState: hueLightState) {
    let on = false;
    let bri = false;
    let ct = false;

    if (light.onControlled) {
      on = (
        (light.smartoffOn !== null) &&
        (light.smartoffOn !== prevLightState.on)
      );
    }

    if (light.briControlled) {
      bri = (
        (light.smartoffBri !== null) &&
        (light.smartoffBri !== prevLightState.bri)
      );
    }

    if (light.ctControlled) {
      ct = (
        (light.smartoffCt !== null) &&
        (light.smartoffCt !== prevLightState.ct)
      );
    }

    const smartOff = on || bri || ct;
    light.smartoffActive = smartOff;
    return this.lightsRepository.save(light);
  }

  async resetSmartOff(light: Light) {
    const hue = await this.hueService.findOneLight(light.id);

    light.smartoffOn = hue.state.on || null;
    light.smartoffBri = hue.state.bri || null;
    light.smartoffCt = hue.state.ct || null;
    light.smartoffActive = false;

    return this.lightsRepository.save(light);
  }

  async nextState(light: Light, currentState: hueLightState): Promise<hueSetState> {
    let state: hueSetState = {};

    const brightness = await this.brightness(light);
    const colorTemp = await this.colorTemp(light);

    if (light.ctControlled) {
      state.ct = colorTemp;
    }
    if (light.briControlled) {
      state.bri = brightness;
    }
    if (light.onControlled) {
      if (light.on === false) {
        state.on = false;
      } else if (brightness > light.onThreshold) {
        state.on = true;
      } else {
        state.on = false;
      }
    }
    if (state.on === false) {
      state = {on: false};
    }

    // Do not send a request if the light stays off
    if ((currentState.on === false) && (state.on !== true)) {
      state = {};
    }

    // Signify recommends to not resent the 'on' value
    if (state.on === currentState.on) {
      state.on = undefined;
    }

    return state;
  }
}
