import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Generated,
    OneToOne,
    OneToMany
} from 'typeorm';
import { AdminFile } from './AdminFile';

@Entity('adminUser')
export class AdminUser{
    @PrimaryGeneratedColumn()
    id: number; 

    @Column()
    @Generated('uuid')
    @Index()
    uuid: string; 

    @Column({ nullable: false })
    userName: string;

    @Column({ nullable: false })
    password:string;

    @Column({ nullable: false })
    role:string;

    @Column({ default: false })
    isActive: boolean;

    @OneToMany(() => AdminFile, (adminFile) => adminFile.admin)
    adminFiles: AdminFile[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

}