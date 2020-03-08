import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Post } from "./Post";
import { Photo } from "./Photo";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column("varchar", { length: 30, unique: true })
  userName: string;

  @Field()
  @Column("varchar", { length: 256, unique: true })
  email: string;

  @Column("varchar")
  password: string;

  @Field()
  @Column("text", { nullable: true })
  site: string;

  @Column("bool", { default: false })
  confirmed: boolean;

  @OneToMany(
    type => Post,
    post => post.user
  )
  post: Post;

  @Field()
  @OneToOne(type => Photo)
  @JoinColumn()
  photo: Photo;

  @Field()
  @CreateDateColumn()
  readonly createdAt?: Date;

  @Field()
  @UpdateDateColumn()
  readonly updateAt?: Date;
}
