import { Curve } from '../../curve/entities/curve.entity';
import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';

@Entity({name: 'light'})
export class LightV1 {
  @PrimaryColumn()
  id: number;

  @Column()
  uniqueId: string;

  @Column()
  name: string;

  @Column({ default: '' })
  type: string;

  @Column({ default: '' })
  modelid: string;

  @Column({ default: '' })
  manufacturername: string;

  @Column({ default: '' })
  productname: string;

  @Column({ default: false })
  on: boolean;

  @Column({ default: false })
  onControlled: boolean;

  @Column({ default: 0 })
  onThreshold: number;

  @Column({ default: false })
  briControlled: boolean;

  @Column({ default: 254 })
  briMax: number;

  @Column({ default: false })
  ctControlled: boolean;

  @Column({ nullable: true, type: 'boolean' })
  smartoffOn: boolean | null;

  @Column({ nullable: true, type: 'integer' })
  smartoffBri: number | null;

  @Column({ nullable: true, type: 'integer' })
  smartoffCt: number | null;

  @Column({ default: false })
  smartoffActive: boolean;

  @Column({ default: true })
  published: boolean;

  @ManyToOne(() => Curve, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  briCurve: Curve;

  @ManyToOne(() => Curve, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  ctCurve: Curve;

  /** Whether the entity was succesfully migrated to the new v2 schema */
  @Column({default: false})
  isMigrated: boolean;
}
