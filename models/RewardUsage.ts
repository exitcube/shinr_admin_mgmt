import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from "typeorm";
import { Reward } from "./Reward";
import { User } from "./User";

@Entity("rewardUsage")
export class RewardUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  rewardId: number;

  @ManyToOne(() => Reward, { onDelete: "CASCADE" })
  @JoinColumn({ name: "rewardId" })
  reward: Reward;

  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  usedCode: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  appliedAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  usedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}