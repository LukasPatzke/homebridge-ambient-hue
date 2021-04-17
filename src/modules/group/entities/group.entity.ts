import { Light } from '../../light/entities/light.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { Position } from '../../position/entities/position.entity';

@Entity()
export class Group {
  @PrimaryColumn()
  id: number;

  @Column()
  uniqueId: string;

  @Column()
  name: string;

  @Column({ default: '' })
  type: string;

  @Column({ default: true })
  published: boolean;

  @ManyToMany(() => Light, {
    eager: true,
  })
  @JoinTable()
  lights: Light[];

  @OneToOne(() => Position, (position) => position.group)
  position: Position;

  on: boolean;
  onControlled: boolean;
  briControlled: boolean;
  ctControlled: boolean;
  smartoffActive: boolean;

  // @AfterLoad() <-- for some reason this does not work
  updateLightState() {
    const reducedLight = this.lights.reduce((prev, current) => {
      prev.on = prev.on && current.on;
      prev.onControlled = prev.onControlled && current.onControlled;
      prev.briControlled = prev.briControlled && current.briControlled;
      prev.ctControlled = prev.ctControlled && current.ctControlled;
      prev.smartoffActive = prev.smartoffActive || current.smartoffActive;
      return prev;
    });
    this.on = reducedLight.on;
    this.onControlled = reducedLight.onControlled;
    this.ctControlled = reducedLight.ctControlled;
    this.briControlled = reducedLight.briControlled;
    this.smartoffActive = reducedLight.smartoffActive;
  }
}
