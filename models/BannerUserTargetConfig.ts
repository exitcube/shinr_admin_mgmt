import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,JoinColumn,OneToOne,ManyToOne, Index } from "typeorm";
import { AdminUser } from '../models';

@Entity("bannerUserTargetConfig")
export class BannerUserTargetConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  displayText: string;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdBy" })
  createdByUser: AdminUser;
}