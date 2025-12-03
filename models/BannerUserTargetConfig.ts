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
import { AdminUser } from "../models";

@Entity("bannerUserTargetConfig")
export class BannerUserTargetConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  displayText: string;

  @Column({ nullable: false })
  value: string;

  @Column({ nullable: false })
  category: string;

  @Column({ default: false })
  isFile: boolean;

  @Column({ nullable: true })
  fileFieldName: string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: false })
  createdBy: string;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdBy" })
  createdByUser: AdminUser;
}
