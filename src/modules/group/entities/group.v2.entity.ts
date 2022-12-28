import { Light } from '../../light/entities/light.v2.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Expose } from 'class-transformer';

@Entity({name: 'v2_group'})
export class Group {
  /** Unique ressource identifier in hue */
  @PrimaryColumn({type: 'uuid'})
  id: string;

  /** Legacy v1 ressource identifier in hue  */
  @Column({nullable: true, type: 'varchar'})
  legacyId: string | null;

  /** Unique accessory identifier in HomeKit */
  @Column({type: 'uuid'})
  accessoryId: string;

  /** Human readable name in hue */
  @Column()
  name: string;

  /** Ressource type in hue */
  @Column({type: 'varchar'})
  type: 'room' | 'zone';

  /** Whether the group is published */
  @Column({ default: true })
  published: boolean;

  /** The lights associated with the group */
  @ManyToMany(() => Light, {
    eager: true,
  })
  @JoinTable()
  lights: Light[];

  /** Whether all lights in the group are On in ambientHUE */
  @Expose()
  get on(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.on, true);
  }

  /** Whether amientHUE controls the On/Off state of all lights in the group */
  @Expose()
  get allOnControlled(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.onControlled, true);
  }

  /** Whether amientHUE controls the brightness of all lights in the group */
  @Expose()
  get allBrightnessControlled(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.brightnessControlled, true);
  }

  /** Whether amientHUE controls the color temperature of all lights in the group */
  @Expose()
  get allColorTemperatureControlled(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.colorTemperatureControlled, true);
  }

  /** Whether smartoff is active for any light in the group */
  @Expose()
  get smartOff(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.smartOff, true);
  }
}
