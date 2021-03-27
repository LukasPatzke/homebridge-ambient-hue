import { Light } from '../../light/entities/light.entity';
import { Position } from '../../position/entities/position.entity';
import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable, OneToOne } from 'typeorm';

@Entity()
export class Group {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column({default: ''})
    type: string;

    @ManyToMany(() => Light, {
      eager: true,
    })
    @JoinTable()
    lights: Light[];

    @OneToOne(() => Position, position => position.group)
    position: Position;
}
