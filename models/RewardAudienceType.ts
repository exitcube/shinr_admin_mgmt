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
import { Reward } from "./Reward";
import { RewardUserTargetConfig } from "./RewardUserTargetConfig";

@Entity("rewardAudienceType")
export class RewardAudienceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Index()
  rewardId: number;

  @ManyToOne(() => Reward, { onDelete: "CASCADE" })
  @JoinColumn({ name: "rewardId" })
  reward: Reward;

  @Column({ nullable: true })
  @Index()
  rewardConfigId: number;

  @ManyToOne(() => RewardUserTargetConfig, { onDelete: "CASCADE" })
  @JoinColumn({ name: "rewardConfigId" })
  rewardConfig: RewardUserTargetConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;
}