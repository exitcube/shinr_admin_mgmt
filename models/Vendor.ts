import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,JoinColumn,OneToOne,ManyToOne,Generated,Index} from "typeorm";
import { VendorFile } from "./VendorFile";

@Entity("vendor")
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated("uuid")
  @Index()
  uuid: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, unique: true })
  mobile: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastActive: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  profilePicId: number;

  @OneToOne(() => VendorFile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profilePicId" })
  vendorFile: VendorFile;

  @Column({ nullable: true })
  vendorCode: string;
}