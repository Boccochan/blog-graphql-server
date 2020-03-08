import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("text")
  content: string;

  @ManyToOne(
    type => Post,
    post => post.comment
  )
  post: Post;

  @CreateDateColumn()
  readonly createdAt?: Date;

  @UpdateDateColumn()
  readonly updateAt?: Date;
}
