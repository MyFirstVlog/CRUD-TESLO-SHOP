import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    email: string;

    @Column('text',{
        select: false
    })
    password: string; 

    @Column('text')
    fullName: string;

    @Column('bool', {
        nullable: false,
        default: true,
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[]
    
    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeInsertOrUpdate(){
        this.email = this.email.trim().toLowerCase();
    }
}

