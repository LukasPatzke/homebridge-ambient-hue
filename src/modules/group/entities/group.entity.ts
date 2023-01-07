import { Expose } from 'class-transformer';
import { BrightnessCurve } from 'src/modules/curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from 'src/modules/curve/entities/colorTemperature.curve.entity';
import {
  Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Light } from '../../light/entities/light.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  /** Unique ressource identifier in hue */
  @Column({ nullable: true, type: 'varchar' })
  hueId: string | null;

  /** Legacy v1 ressource identifier in hue  */
  @Column({ nullable: true, type: 'varchar' })
  legacyId: string | null;

  /** Unique accessory identifier in HomeKit */
  @Column({ type: 'uuid' })
  accessoryId: string;

  /** Human readable name in hue */
  @Column()
  name: string;

  /** Ressource type in hue */
  @Column({ type: 'varchar' })
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
  get onControlled(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.onControlled, true);
  }

  /** The onThreshold of the first light in the group */
  @Expose()
  get onThreshold(): number {
    if (this.lights.length === 0) {
      return 0;
    }
    return this.lights[0].onThreshold;
  }

  /** Whether amientHUE controls the brightness of all lights in the group */
  @Expose()
  get brightnessControlled(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.brightnessControlled, true);
  }

  /** The brightnessFactor of the first light in the group */
  @Expose()
  get brightnessFactor(): number {
    if (this.lights.length === 0) {
      return 100;
    }
    return this.lights[0].brightnessFactor;
  }

  /** Whether amientHUE controls the color temperature of all lights in the group */
  @Expose()
  get colorTemperatureControlled(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.colorTemperatureControlled, true);
  }

  /** Whether smartoff is active for any light in the group */
  @Expose()
  get smartOff(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator && current.smartOff, true);
  }

  /** Whether any of the lights in the group is capable to display brightness */
  @Expose()
  get isBrightnessCapable(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator || current.isBrightnessCapable, false);
  }

  /** Whether any of the the lights in the group is capable to display color temperature */
  @Expose()
  get isColorTemperatureCapable(): boolean {
    return this.lights.reduce((accumulator, current) => accumulator || current.isColorTemperatureCapable, false);
  }

  /** The brightnessCurve of the first light in the group */
  @Expose()
  get brightnessCurve(): BrightnessCurve | undefined {
    if (this.lights.length === 0) {
      return;
    }
    return this.lights[0].brightnessCurve;
  }

  /** The brightnessCurve of the first light in the group */
  @Expose()
  get colorTemperatureCurve(): ColorTemperatureCurve | undefined {
    if (this.lights.length === 0) {
      return;
    }
    return this.lights[0].colorTemperatureCurve;
  }

  @Expose()
  get resource(): string {
    return `groups/${this.id}`;
  }
}
