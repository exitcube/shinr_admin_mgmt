import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Generated,
    OneToOne
} from 'typeorm';
import { UserDevice } from '../models';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number; // internal auto-increment id (good for sorting)

    @Column()
    @Generated('uuid')
    @Index()
    uuid: string; // external unique identifier (safe for exposure)

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true, unique: true })
    email: string;

    @Column({ unique: true, nullable: false })
    @Index()
    mobile: string;

    @Column({ default: false })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastActive: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => UserDevice, device => device.user)
    device: UserDevice;
}
