import { Group } from '../../group/entities/group.entity';
import { Light } from '../../light/entities/light.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Position {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 9999 })
    position: number;

    @Column({ default: false })
    visible: boolean;

    @OneToOne(() => Light, light => light.position)
    @JoinColumn()
    light: Light;

    @OneToOne(() => Group, group => group.position)
    @JoinColumn()
    group: Group;
}
