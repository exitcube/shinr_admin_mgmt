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
import { Banner} from "./../models";

@Entity("bannersByLocation")
export class BannersByLocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    @Index()
    bannerId: number;

    @ManyToOne(() => Banner, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bannerId" })
    banner: Banner;

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
