import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("rewardOfferType")
export class RewardOfferType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false})
  offerType: string;

  @Column({ nullable: true })
  percentage: number;

  @Column({ nullable: false })
  maxAmount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}