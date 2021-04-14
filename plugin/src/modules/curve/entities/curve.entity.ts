import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Point } from '../../point/entities/point.entity';

@Entity()
export class Curve {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  kind: string;

  @Column({ default: false })
  default: boolean;

  @OneToMany(() => Point, (point) => point.curve, {
    cascade: true,
  })
  points: Point[];
}
