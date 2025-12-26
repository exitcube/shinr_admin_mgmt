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
import { User } from "./User";


@Entity("rewardUserTarget")
export class RewardUserTarget {
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