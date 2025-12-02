import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
  Index,
} from "typeorm";
import { Banner, User } from "../models";

@Entity("bannerUserTarget")
export class BannerUserTarget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Index()
  bannerId: number;

  @ManyToOne(() => Banner, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bannerId" })
  banner: Banner;

  @Column({ nullable: true })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;
}
