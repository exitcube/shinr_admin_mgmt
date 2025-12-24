import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("rewardContribution")
export class RewardContribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  contributor: string;

  @Column({ nullable: true })
  shinrPercentage: number;

  @Column({ nullable: true })
  vendorPercentage: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}