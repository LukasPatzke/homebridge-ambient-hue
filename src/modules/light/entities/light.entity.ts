import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BrightnessCurve } from '../../curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from '../../curve/entities/colorTemperature.curve.entity';

@Entity()
export class Light {
  @PrimaryGeneratedColumn()
  id: number;

  /** Unique ressource identifier in hue */
  @Column()
  hueId: string;

  /** Legacy v1 ressource identifier in hue  */
  @Column({nullable: true, type: 'varchar'})
  legacyId: string | null;

  /** Unique accessory identifier in HomeKit */
  @Column({type: 'uuid'})
  accessoryId: string;

  /** Ressource identifier of the owner in hue  */
  @Column({nullable: true, type: 'uuid'})
  deviceId: string | null;

  /** Human readable name in hue */
  @Column()
  name: string;

  /** Light archetype in hue */
  @Column()
  archetype: string;

  /** Current On/Off state of the light in hue */
  @Column({ nullable: true, type: 'boolean'})
  currentOn: boolean | null;

  /** Current brightness percentage of the light in hue */
  @Column({ nullable: true, type: 'integer'})
  currentBrightness: number | null;

  /** Current color temperature of the light in hue */
  @Column({ nullable: true, type: 'integer'})
  currentColorTemperature: number | null;

  /** On/Off state in amientHUE */
  @Column({ default: false })
  on: boolean;

  /** Whether amientHUE controls the On/Off state */
  @Column({ default: false })
  onControlled: boolean;

  /** The brightness threshold the lights needs to exceed to be turned on */
  @Column({ default: 0 })
  onThreshold: number;

  /** Whether amientHUE controls the brightness */
  @Column({ default: false })
  brightnessControlled: boolean;

  /** Brightness multiplication factor (percentage)*/
  @Column({ default: 100 })
  brightnessFactor: number;

  /** Whether amientHUE controls the color temperature*/
  @Column({ default: false })
  colorTemperatureControlled: boolean;

  /** The last On/Off state that was set by ambientHUE */
  @Column({ nullable: true, type: 'boolean' })
  lastOn: boolean | null;

  /** The last brightness value that was set by ambientHUE */
  @Column({ nullable: true, type: 'integer' })
  lastBrightness: number | null;

  /** The last color temperatur that was set by ambientHUE */
  @Column({ nullable: true, type: 'integer' })
  lastColorTemperature: number | null;

  /** Whether the light is published */
  @Column({ default: true })
  published: boolean;

  @Column({ default: 0})
  brightnessCurveId: number;

  /** The brightness curve that is associated with the light */
  @ManyToOne(() => BrightnessCurve, {
    eager: true,
    nullable: false,
    onDelete: 'DEFAULT',
  })
  @JoinColumn({name: 'brightnessCurveId' })
  brightnessCurve: BrightnessCurve;

  @Column({ default: 0})
  colorTemperatureCurveId: number;

  /** The color temperature curve that is associated with the light */
  @ManyToOne(() => ColorTemperatureCurve, {
    eager: true,
    nullable: true,
    onDelete: 'DEFAULT',
  })
  @JoinColumn({name: 'colorTemperatureCurveId' })
  colorTemperatureCurve: ColorTemperatureCurve;

  /** Whether the On/Off property was changed by a third party */
  @Expose()
  get smartOffOn(): boolean {
    if (!this.onControlled) {
      return false;
    }
    return this.lastOn !== null &&
           this.lastOn !== this.currentOn;
  }


  /** Whether the brightness property was changed by a third party */
  @Expose()
  get smartOffBrightness(): boolean {
    if (!this.brightnessControlled) {
      return false;
    }
    return this.lastBrightness !== null &&
           this.currentBrightness !== null &&
           Math.abs(this.lastBrightness - this.currentBrightness) >= 1;
  }


  /** Whether the color temperature property was changed by a third party */
  @Expose()
  get smartOffColorTemperature(): boolean {
    if (!this.colorTemperatureControlled) {
      return false;
    }
    return this.lastColorTemperature !== null &&
           this.currentColorTemperature !== null &&
           Math.abs(this.lastColorTemperature - this.currentColorTemperature) >= 1;
  }

  /** Whether any property was changed by a third party */
  @Expose()
  get smartOff(): boolean {
    return this.smartOffOn || this.smartOffBrightness || this.smartOffColorTemperature;
  }

  /** Whether the light is capable to display brightness */
  @Expose()
  get isBrightnessCapable(): boolean {
    return this.currentBrightness !== null;
  }

  /** Whether the light is capable to display color temperature */
  @Expose()
  get isColorTemperatureCapable(): boolean {
    return this.currentColorTemperature !== null;
  }

  @Expose()
  get resource(): string {
    return `lights/${this.id}`;
  }
}