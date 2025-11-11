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
  import { AdminUser } from "./AdminUser";
  import { File } from "./File";
  
  export enum FileCategory {
    LICENSE = "license",
    RC = "rc",
    INSURANCE = "insurance",
    OTHER = "other",
  }
  
  @Entity({ name: "adminfile" })
  export class AdminFile {
    @PrimaryGeneratedColumn()
    id: number;
  

    @Column({ name: "adminId"})
    @Index()
    adminId: string;
  
    @ManyToOne(() => AdminUser, (admin) => admin.adminFiles, { onDelete: "CASCADE" })
    @JoinColumn({ name: "adminId" })
    admin: AdminUser;
  
  
    @Column({ name: "fileId"})
    @Index()
    fileId: number;
  
    @ManyToOne(() => File, (file) => file.adminFiles, { onDelete: "CASCADE" })
    @JoinColumn({ name: "fileId" })
    file: File;
  
    @Column({type: "enum",enum: FileCategory, nullable: false })
    category: FileCategory;
  
    @Column({ default: false })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  