import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  
  @Entity({ name: "file" })
  export class File {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ nullable: false })
    fileName: string;
  
    @Column({ nullable: false })
    storageLocation: string;
  
    @Column({ nullable: false })
    mimeType: string;
  
    @Column({ type: "bigint" })
    sizeBytes: number;
  
    @Column({ nullable: true })
    provider: string;
  
    @Column({ type: "text", nullable: false })
    url: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column({ default: false })
    isActive: boolean;
  }
  