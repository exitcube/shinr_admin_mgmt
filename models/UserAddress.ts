import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import { User } from './User';

@Entity('userAddress')
export class UserAddress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'userId' })
    @Index()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({nullable: true})
    name: string;

    @Column({length: 255 ,nullable: true})
    addressLine1: string;

    @Column({length: 100,nullable: true })
    country: string;

    @Column({length: 100 ,nullable: true})
    city: string;

    @Column({ length: 100,nullable: true })
    state: string;

    @Column({length: 20,nullable: true })
    pinCode: string;

    @Column({ type: 'decimal', precision: 10, scale: 5, nullable: false })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 5, nullable: false })
    longitude: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
