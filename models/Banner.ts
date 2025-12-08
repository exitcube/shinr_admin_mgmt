import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,JoinColumn,OneToOne,ManyToOne, Index } from "typeorm";
import { AdminFile,AdminUser } from '../models';
import { Vendor } from "./Vendor";
import { BannerCategory } from "./BannerCategory";

@Entity("banner")
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  bgImageId: number;

  @OneToOne(() => AdminFile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bgImageId" })
  adminFile: AdminFile;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => BannerCategory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "categoryId" })
  bannerCategory: BannerCategory;

  @Column({ nullable: true })
  owner: string;

  @Column({ nullable: true })
  @Index()
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "vendorId" })
  vendor: Vendor;

  @Column({ nullable: true })
  homePageView: boolean;

  @Column({ nullable: true })
  displaySequence: number;

  @Column({ nullable: true })
  targetValue: string;

  @Column({ type: 'date', nullable: true })
  startTime: Date;

  @Column({ type: 'date', nullable: true })
  endTime: Date;

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
  status: string;

  @Column({ nullable: true })
  reviewStatus: string;

  @Column({ nullable: true })
  rejectReason: string;

  @Column({ nullable: true })
  approvedBy: number;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "approvedBy" })
  approvedByAdminUser: AdminUser;

  @CreateDateColumn({type: 'timestamptz'})
  createdAt: Date;

  @UpdateDateColumn({type: 'timestamptz'})
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;
}