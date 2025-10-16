import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { User } from './User';

@Entity('userDevice')
export class UserDevice {
    @PrimaryGeneratedColumn()
    id: number; // internal auto-increment id (good for sorting)

    @Column()
    @Generated('uuid')
    @Index()
    uuid: string; // external unique identifier (safe for exposure)

    @Column({ name: 'userId' })
    @Index()
    userId: number;

    @ManyToOne(() => User,{ onDelete: 'CASCADE'})
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastActive: Date;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ type: 'timestamp', nullable: true })
    lastLogoutTime: Date;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ default: true })
    isActive: boolean;


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}

