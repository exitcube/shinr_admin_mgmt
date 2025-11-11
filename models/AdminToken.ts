import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { AdminUser } from './AdminUser';



@Entity('adminToken')
export class AdminToken {
    @PrimaryGeneratedColumn()
    id: number;  

    @Column()
    @Generated('uuid')
    uuid: string;  

    @Column({ name: 'userId' })
    @Index()
    userId: number;

    @ManyToOne(() => AdminUser,{ onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: AdminUser;


    @Column({ type: 'text' })
    refreshToken: string;

    @Column()
    accessToken: string;

    @Column({ type: 'timestamp', nullable: true })
    refreshTokenExpiry: Date | null;

    @Column()
    refreshTokenStatus: string;

    @Column({ default: false })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
