import { Expose } from 'class-transformer';
import { Entity, OneToMany } from 'typeorm';
import { Point } from '../../point/entities/point.entity';
import { Curve } from './curve';

@Entity()
export class BrightnessCurve extends Curve {
  @OneToMany(() => Point, (point) => point.brightnessCurve, {
    cascade: true,
    eager: true,
  })
  points: Point[];

  kind = 'bri';

  @Expose()
  get resource(): string {
    return `curves/brightness/${this.id}`;
  }
}
