import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BrightnessCurve } from '../../curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from '../../curve/entities/colorTemperature.curve.entity';

@Entity()
export class Point {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column({ default: false })
  first: boolean;

  @Column({ default: false })
  last: boolean;

  @ManyToOne(() => BrightnessCurve, (curve) => curve.points, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  brightnessCurve: BrightnessCurve;

  @ManyToOne(() => ColorTemperatureCurve, (curve) => curve.points, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  colorTemperatureCurve: ColorTemperatureCurve;

  @Expose()
  get resource(): string {
    return `points/${this.id}`;
  }
}
