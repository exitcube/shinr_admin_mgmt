import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('banner')
export class Banner {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({default : false})
    isImage : boolean;

    @Column({ type : 'text', nullable : true})
    text : string;

    @Column({nullable : true})
    bgImageId : string;

    @Column({default : false})
    isActive : boolean;

    @Column({nullable : true})
    buttonText : string;

    @Column({nullable : true})
    targetValue : string;

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

}