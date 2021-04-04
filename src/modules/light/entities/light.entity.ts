import { Curve } from '../../curve/entities/curve.entity';
import { Position } from '../../position/entities/position.entity';
import { Entity, Column, PrimaryColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class Light {
    @PrimaryColumn()
    id: number;

    @Column()
    uniqueId: string;

    @Column()
    name: string;

    @Column({ default: ''})
    type: string;

    @Column({ default: ''})
    modelid: string;

    @Column({ default: ''})
    manufacturername: string;

    @Column({ default: ''})
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

    @Column({ nullable: true, type: 'integer'})
    smartoffBri: number | null;

    @Column({ nullable: true, type: 'integer'})
    smartoffCt: number | null;

    @Column({ default: false})
    smartoffActive: boolean;

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

    @OneToOne(() => Position, position => position.light)
    position: Position;
}
