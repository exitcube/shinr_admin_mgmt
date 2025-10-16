import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
    Generated
} from 'typeorm';
import { User } from './User';
import { UserDevice } from './UserDevice';

@Entity('userOtp')
export class UserOtp {
    @PrimaryGeneratedColumn()
    id: number; // internal auto-increment id (good for sorting)

    @Column()
    @Generated('uuid')
    uuid: string; // external unique identifier (safe for exposure)

    @Column({ name: 'userId' })
    @Index()
    userId: number;

    @ManyToOne(() => User,{ onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ name: 'deviceId' })
    @Index()
    deviceId: number;

    @ManyToOne(() => UserDevice,{ onDelete: 'CASCADE' })
    @JoinColumn({ name: 'deviceId' })
    device: UserDevice;

    @Column()
    otp: string;

    @Column()
    otpToken: string;

    @Column({ type: 'timestamp' })
    lastRequestedTime: Date;

    @Column({ type: 'smallint', default: 0 })
    requestCount: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
