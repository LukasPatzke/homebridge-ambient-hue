import { Entity, OneToMany } from 'typeorm';
import { Point } from '../../point/entities/point.entity';
import { Curve } from './curve';

@Entity()
export class ColorTemperatureCurve extends Curve {
  @OneToMany(() => Point, (point) => point.colorTemperatureCurve, {
    cascade: true,
    eager: true,
  })
  points: Point[];

  kind = 'ct';
}
