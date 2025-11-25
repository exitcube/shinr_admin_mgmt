import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
  } from "typeorm";
   
  import { File } from "./File";
  import { Vendor } from "./Vendor";
  
  @Entity({ name: "vendorFile" }) 
  export class VendorFile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: "userId" })
    @Index()
    vendorId: number;
  
    @ManyToOne(() => Vendor, { onDelete: "CASCADE" })
    @JoinColumn({ name: "vendorId" })
    user: Vendor;
  
    @Column({ name: "fileId" })
    @Index()
    fileId: number;
  
    @ManyToOne(() => File, { onDelete: "CASCADE" })
    @JoinColumn({ name: "fileId" })
    file: File;
  
    @Column({ nullable: true })
    category: string;
  
    @Column({ default: false })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }