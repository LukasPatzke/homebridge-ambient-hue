import { Expose } from 'class-transformer';
import { Entity, OneToMany } from 'typeorm';
import { Point } from '../../point/entities/point.entity';
import { Curve } from './curve';

@Entity()
export class ColorTemperatureCurve extends Curve {
  @OneToMany(() => Point, (point) => point.colorTemperatureCurve, {
    cascade: true,
  })
  points?: Point[];

  kind = 'ct';

  @Expose()
  get resource(): string {
    return `curves/colorTemperature/${this.id}`;
  }
}

export class ColorTemperatureCurveWithPoints extends ColorTemperatureCurve {
  points: Point[];
}

export function isColorTemperatureCurveWithPoints(
  curve: ColorTemperatureCurve,
): curve is ColorTemperatureCurveWithPoints {
  return (curve as ColorTemperatureCurveWithPoints).points !== undefined;
}
