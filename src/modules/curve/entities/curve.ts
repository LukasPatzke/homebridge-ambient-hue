import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class Curve {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
