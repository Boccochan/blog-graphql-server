import { Length } from 'class-validator';
import {
    UpdateDateColumn,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    OneToMany,
    JoinTable,
    ManyToMany
} from "typeorm";

import { ObjectType, Field, ID } from "type-graphql";
import { User } from './User';
import { Comment } from './Comment';
import { Category } from './Category';

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('varchar', { length: 120, nullable: false })
    @Length(1, 120)
    title: string;

    @Field()
    @Column('text', { nullable: false })
    @Length(1, 20000)
    content: string;

    @Column()
    good: number;

    @Column()
    bad: number;

    @ManyToOne(type => User, user => user.post)
    user: User;

    @OneToMany(type => Comment, comment => comment.post)
    comment: Comment;

    @ManyToMany(type => Category)
    @JoinTable()
    categories: Category[]

    @CreateDateColumn()
    readonly createdAt?: Date;

    @UpdateDateColumn()
    readonly updateAt?: Date;
}

