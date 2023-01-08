import { BadRequestException, Injectable } from '@nestjs/common';
import { PointService } from '../point/point.service';
import { InsertPointDto } from './dto/insert-point.dto';
import { BrightnessCurveWithPoints } from './entities/brightness.curve.entity';
import { ColorTemperatureCurveWithPoints } from './entities/colorTemperature.curve.entity';
import { monospline } from './interpolation';

@Injectable()
export class CurveService {
  constructor(private pointService: PointService) {}

  async insertPoint(
    curve: BrightnessCurveWithPoints | ColorTemperatureCurveWithPoints,
    insertPointDto: InsertPointDto,
  ) {
    const points = curve.points;
    const point = points[insertPointDto.index];

    let xLocation: number;

    if (insertPointDto.position === 'after') {
      if (point.last) {
        throw new BadRequestException('Can not create Point after last Point');
      } else {
        xLocation = this.pointService.newPointLocation(
          points[insertPointDto.index],
          points[insertPointDto.index + 1],
        );
      }
    } else {
      if (point.first) {
        throw new BadRequestException(
          'Can not create Point before first Point',
        );
      } else {
        xLocation = this.pointService.newPointLocation(
          points[insertPointDto.index - 1],
          points[insertPointDto.index],
        );
      }
    }
    return await this.pointService.create({
      x: xLocation,
      y: await this.calcValue(curve, xLocation),
      brightnessCurve: curve.kind === 'bri' ? curve : undefined,
      colorTemperatureCurve: curve.kind === 'ct' ? curve : undefined,
    });
  }

  /**
   * Calculate the value from the points or the curve.
   * @param id Curve id
   * @param x Time in Seconds, defaults to now
   * @returns new y value
   */
  async calcValue(
    curve: BrightnessCurveWithPoints | ColorTemperatureCurveWithPoints,
    x?: number,
  ): Promise<number> {
    const points = curve.points;
    const spline = monospline(
      points.map((point) => point.x),
      points.map((point) => point.y),
    );

    if (x === undefined) {
      const now = new Date();
      const startOfDay = new Date();
      startOfDay.setHours(0);
      startOfDay.setMinutes(0);
      startOfDay.setSeconds(0);
      startOfDay.setMilliseconds(0);
      const delta = now.valueOf() - startOfDay.valueOf();
      x = (Math.floor(delta / 60_000) + 1200) % 1440;
    }

    return Math.round(spline(x));
  }
}
