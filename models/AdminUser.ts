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

    @Column({ nullable: true })
    email:string;

    @Column({ nullable: false })
    empCode:string;

    @Column({ default: false })
    isActive: boolean;

    @Column({ type: 'date', nullable: false })
    joiningDate: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

}