import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
    
} from 'typeorm';

import { AdminFile } from './AdminFile';
import { AdminUser } from './AdminUser';

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    displayName: string;

    @Column({ nullable: true })
    imageId: number;

    @OneToOne(() => AdminFile, { onDelete: "CASCADE" })
    @JoinColumn({ name: "imageId" })
    adminFile: AdminFile;

    @Column({ type: 'varchar', nullable: true })
    value: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    displaySequence: number;

    @Column({ nullable: true })
    status: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: false })
    createdBy: number;

    @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
    @JoinColumn({ name: "createdBy" })
    createdByAdminUser: AdminUser;

    @Column({ nullable: true })
    removedBy: number;

    @ManyToOne(() => AdminUser, { onDelete: "CASCADE" })
    @JoinColumn({ name: "removedBy" })
    removedByAdminUser: AdminUser;


}