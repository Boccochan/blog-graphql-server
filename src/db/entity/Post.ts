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
import { User } from "./User";
import { Comment } from "./Comment";
import { Category } from "./Category";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("varchar", { nullable: false })
  title: string;

  @Field()
  @Column("text", { nullable: false })
  content: string;

  @Column({ default: 0 })
  good: number;

  @Column({ default: 0 })
  bad: number;

  @ManyToOne(
    type => User,
    user => user.post
  )
  user: User;

  @OneToMany(
    type => Comment,
    comment => comment.post
  )
  comment: Comment;

  @ManyToMany(type => Category)
  @JoinTable()
  categories: Category[];

  @Field()
  @CreateDateColumn()
  readonly createdAt?: Date;

  @Field()
  @UpdateDateColumn()
  readonly updateAt?: Date;
}
