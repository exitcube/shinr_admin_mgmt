import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,JoinColumn,OneToOne,ManyToOne, Index } from "typeorm";
import { AdminFile,AdminUser } from '../models';
import { Vendor } from "./Vendor";

@Entity("banner")
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isImage: boolean;

  @Column({ nullable: true })
  bgImageId: number;

  @OneToOne(() => AdminFile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bgImageId" })
  bgImage: AdminFile;

  @Column({ type: "text", nullable: true })
  text: string;

  @Column({ nullable: true })
  bgColour: string;

  @Column({ nullable: true })
  buttonText: string;

  @Column({ nullable: true })
  buttonColour: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  category: string;

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

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  createdBy: number;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdBy" })
  createdByUser: AdminUser;

  @Column({ nullable: true })
  updatedBy: number;

  @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
  @JoinColumn({ name: "updatedBy" })
  updatedByUser: AdminUser;

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
  approvedByUser: AdminUser;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isActive: boolean;
}