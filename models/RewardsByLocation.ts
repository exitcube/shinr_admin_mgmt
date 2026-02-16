import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
    Index,
} from "typeorm";
import { Reward} from "./../models";

@Entity("rewardssByLocation")
export class RewardsByLocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    @Index()
    rewardId: number;

    @ManyToOne(() => Reward, { onDelete: "CASCADE" })
    @JoinColumn({ name: "rewardId" })
    reward: Reward;

    @Column({ type: 'decimal', precision: 10, scale: 5, nullable: false })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 5, nullable: false })
    longitude: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ default: false })
    isActive: boolean;
}
