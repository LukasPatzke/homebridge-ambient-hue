import { LightV1 } from '../../light/entities/light.v1.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({name: 'group'})
export class GroupV1 {
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

  @ManyToMany(() => LightV1, {
    eager: true,
  })
  @JoinTable()
  lights: LightV1[];

  /** Whether the entity was succesfully migrated to the new v2 schema */
  @Column({default: false})
  isMigrated: boolean;

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
