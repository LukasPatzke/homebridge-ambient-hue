import { Curve } from '../../curve/entities/curve.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


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

    @Column( {default: false })
    last: boolean;

    @ManyToOne(() => Curve, curve => curve.points)
    curve: Curve;
}