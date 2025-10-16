import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  Generated
} from "typeorm";
import { CarMake } from "./CarMake";
import { CarCategory } from "./CarCategory";

@Entity("cars")
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  model: string;

  @Column({ name: 'makeId' })
  @Index()
  makeId: number;

  @ManyToOne(() => CarMake, (make) => make.cars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'makeId' })
  make: CarMake;

  @Column({ name: 'categoryId' })
  @Index()
  categoryId: number;

  @ManyToOne(() => CarCategory, (category) => category.cars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: CarCategory;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
