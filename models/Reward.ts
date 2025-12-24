import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,JoinColumn,OneToOne,ManyToOne, Index } from "typeorm";
import { Vendor } from "./Vendor";
import { AdminUser } from "./AdminUser";
import { RewardCategory } from "./RewardCategory";
import { RewardOfferType } from "./RewardOfferType";
import { RewardContribution } from "./RewardContribution";

@Entity("reward")
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  summary: string;

  @Column({ nullable: false })
  sideText: string;

  @Column({ nullable: false })
  categoryId: number;

  @ManyToOne(() => RewardCategory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "categoryId" })
  rewardCategory: RewardCategory;

  @Column({ nullable: true })
  displaySequence: number;

  @Column({ nullable: true })
  owner: string;

  @Column({ nullable: true })
  @Index()
  vendorId: number;

  @ManyToOne(() => Vendor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "vendorId" })
  vendor: Vendor;

  @Column({ default: false })
  dispCouponPage: boolean;

  @Column({ default: false })
  dispVendorPage: boolean;

  @Column({ nullable: false, default: 0 })
  minOrderValue: number;

  @Column({ nullable: false })
  rewardOfferTypeId: number;

  @ManyToOne(() => RewardOfferType, { onDelete: "CASCADE" })
  @JoinColumn({ name: "rewardOfferTypeId" })
  rewardOfferType: RewardOfferType;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ nullable: false })
  grabLimit: number;

  @Column({ nullable: false })
  maxUsage: number;

  @Column({ nullable: true })
  maxUsagePeriod: string;

  @Column({ nullable: true })
  maxUsagePeriodValue: number;

  @Column({ nullable: false })
  rewardContributorId: number;

  @ManyToOne(() => RewardContribution, { onDelete: "CASCADE" })
  @JoinColumn({ name: "rewardContributorId" })
  rewardContributor: RewardContribution;

  @Column({ nullable: true })
  codeType: string;

  @Column({ nullable: true })
  singleCode: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  createdBy: number;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdBy" })
  createdByAdminUser: AdminUser;

  @Column({ nullable: true })
  updatedBy: number;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "updatedBy" })
  updatedByAdminUser: AdminUser;

  @Column({ nullable: true })
  removedBy: number;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "removedBy" })
  removedByAdminUser: AdminUser;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;

}