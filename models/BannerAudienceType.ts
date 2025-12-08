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
import { Banner } from "./Banner";
import { BannerUserTargetConfig } from "./BannerUserTargetConfig";

@Entity("bannerAudienceType")
export class BannerAudienceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bannerId: number;

  @ManyToOne(() => Banner, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bannerId" })
  banner: Banner;

  @Column({ nullable: true })
  bannerConfigId: number;

  @ManyToOne(() => BannerUserTargetConfig, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bannerConfigId" })
  bannerConfig: BannerUserTargetConfig;

  @CreateDateColumn({type: 'timestamptz'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamptz'})
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;
}
