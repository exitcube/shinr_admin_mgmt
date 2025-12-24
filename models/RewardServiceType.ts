import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,JoinColumn,OneToOne,ManyToOne, Index } from "typeorm";
import { Reward } from "./Reward";
import { Service } from "./Service";


@Entity("rewardServiceType")
export class RewardServiceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Index()
  rewardId: number;

  @ManyToOne(() => Reward, { onDelete: "CASCADE" })
  @JoinColumn({ name: "rewardId" })
  reward: Reward;

  @Column({ nullable: false })
  @Index()
  serviceId: number;

  @ManyToOne(() => Service, { onDelete: "CASCADE" })
  @JoinColumn({ name: "serviceId" })
  service: Service;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;
}