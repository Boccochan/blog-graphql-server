import { Keyword } from "./Keyword";
import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";

import { ObjectType, Field, ID } from "type-graphql";
import { User } from "./User";
import { Comment } from "./Comment";

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

  @Field()
  @Column({ default: 0 })
  good: number;

  @Field()
  @Column({ default: 0 })
  bad: number;

  @Field(() => User)
  @ManyToOne(
    () => User,
    user => user.post
  )
  user: User;

  @OneToMany(
    () => Comment,
    comment => comment.post
  )
  comment: Comment;

  @Field(() => [Keyword])
  @ManyToMany(() => Keyword)
  @JoinTable({
    name: "post_keyword_map",
    joinColumn: { referencedColumnName: "id", name: "postId" },
    inverseJoinColumn: { referencedColumnName: "id", name: "keywordId" }
  })
  keyword: Keyword[];

  @Field()
  @CreateDateColumn()
  readonly createdAt?: Date;

  @Field()
  @UpdateDateColumn()
  readonly updateAt?: Date;
}
