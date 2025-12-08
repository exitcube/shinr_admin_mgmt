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
  
  @Entity("adminFile")
  export class AdminFile {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: "adminId" })
    @Index()
    adminId: string;
  
    @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
    @JoinColumn({ name: "adminId" })
    admin: AdminUser;
  
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
  